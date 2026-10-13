"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mic2, Square } from "lucide-react";

export type RecordedAudio = {
  base64: string; // raw base64, no "data:...;base64," prefix (what Gemini wants)
  mimeType: string; // e.g. "audio/webm" or "audio/mp4"
};

type VoiceRecorderProps = {
  onRecordingComplete?: (audio: RecordedAudio) => void;
  disabled?: boolean;
};

// Chrome/Firefox/Edge record webm, Safari records mp4. Pick the first one supported.
const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const VoiceRecorder = ({ onRecordingComplete, disabled = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audio, setAudio] = useState<RecordedAudio | null>(null);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Release the mic if the component unmounts mid-recording
  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // Elapsed-time counter while recording
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // If the language changes away from English mid-recording, stop cleanly
  useEffect(() => {
    if (disabled && mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop(); // onstop below updates the state
    }
  }, [disabled]);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferred = PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        const type = recorder.mimeType || preferred || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        try {
          const base64 = await blobToBase64(blob);
          const result = { base64, mimeType: type.split(";")[0] };
          setAudio(result);
          onRecordingComplete?.(result);
        } catch {
          setError("Couldn't process recording");
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setSeconds(0);
      setIsRecording(true);
    } catch {
      setError("Mic blocked or unavailable");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  // Every state of the status slot fills the same h-10 pill, so nothing shifts.
  const pill = "flex h-10 w-full items-center rounded-full px-4 text-sm";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Mic button: same 48px circle in every state */}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-describedby="voice-hint"
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B] disabled:cursor-not-allowed disabled:opacity-40 ${
          isRecording
            ? "border-red-500 bg-red-500 text-white"
            : "border-[#B85C1E] bg-[#4A2208] text-[#FFB86B] hover:border-[#FFB86B] hover:bg-[#5A2B0C]"
        }`}
      >
        {isRecording ? (
          <Square className="h-4 w-4 fill-current" />
        ) : (
          <Mic2 className="h-5 w-5" />
        )}
      </button>

      <p id="voice-hint" className="w-[120px] text-xs leading-snug text-[#FFB86B]/70">
        Only English recording is allowed
      </p>

      {/* Fixed-size status slot: error, recording, player or empty state */}
      <div className="flex h-12 w-[220px] items-center sm:w-[240px]">
        {error ? (
          <p role="alert" className={`${pill} truncate bg-red-500/15 font-medium text-[#FFD4A3]`}>
            {error}
          </p>
        ) : isRecording ? (
          <div className={`${pill} gap-2 border border-red-500/60 bg-red-500/10 text-white`}>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <span>Recording</span>
            <span className="ml-auto tabular-nums text-[#FFB86B]">{formatTime(seconds)}</span>
          </div>
        ) : audio ? (
          <audio
            controls
            className="h-10 w-full"
            src={`data:${audio.mimeType};base64,${audio.base64}`}
          />
        ) : (
          <div className={`${pill} border border-dashed border-[#B85C1E] text-[#FFB86B]/50`}>
            No recording yet
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;