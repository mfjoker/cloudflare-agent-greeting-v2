import { MutableRefObject, useEffect, useRef, useState } from "react";
import RecordRTC from "recordrtc";
import { BsRecordCircle } from "react-icons/bs";
import ReactDOM from "react-dom";
import { recorderData } from "@/utils/misc/types";

type PropTypes = {
  language: string;
  promptId?: string;
  setShow: (show: boolean) => void;
  onClose: (valueFromRecorder: recorderData) => void;
};

const Recorder = ({ promptId, language, setShow, onClose }: PropTypes) => {
  const [recording, setRecording] = useState<boolean>(false);
  const mediaRecorderRef: MutableRefObject<RecordRTC | null> =
    useRef<RecordRTC | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const mediaChunksRef: MutableRefObject<Blob[]> = useRef<Blob[]>([]);
  const [blobUrl, setBlobUrl] = useState<string>("");

  useEffect(() => {
    console.log("Prompt: ", promptId, " Language Sent: ", language);
  }, [language]);

  const handleCancel = () => {
    if (setShow) {
      setShow(false);
    }
    if (onClose) {
      const valueToSend: recorderData = {
        blobUri: "",
        duration: 0,
        language: "",
        saveToAllLanguages: false,
        success: false,
      };
      onClose(valueToSend);
    }
  };

  const handleSave = (saveToAll: boolean) => {
    console.log("handleSave...Save Recording");
    if (setShow) {
      setShow(false);
    }
    if (onClose) {
      const valueToSend: recorderData = {
        blobUri: blobUrl,
        duration: duration,
        language: language,
        saveToAllLanguages: saveToAll,
        success: true,
      };
      console.log("onClose...Value to Send: ", valueToSend);
      onClose(valueToSend);
    }
  };

  const handleStartRecording = () => {
    console.log("Start Recording");
    setBlobUrl("");
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
        },
      })
      .then((stream) => {
        console.log("...getUserMedia success");

        mediaChunksRef.current = [];
        mediaRecorderRef.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/wav",
          numberOfAudioChannels: 1,
          bitsPerSecond: 128000,
          audioBitsPerSecond: 128000,
          desiredSampRate: 8000,
          recorderType: RecordRTC.StereoAudioRecorder,
        });
        // @ts-ignore: mediaRecorderRef.current.ondataavailable this does work (this is a bug)
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        let date, time;
        // @ts-ignore: mediaRecorderRef.current.onstop this does work (this is a bug)
        mediaRecorderRef.current.onstop = handleRecordingStop;
        mediaRecorderRef.current.startRecording();
        setRecording(true);
        date = new Date();
        time = date.getTime();
        setDuration(time);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(() => {
        // @ts-ignore: mediaRecorderRef.current.getBlob() this does work (this is a bug)
        const audioBlob = mediaRecorderRef.current.getBlob();
        const downloadUrl = URL.createObjectURL(audioBlob);
        setBlobUrl(downloadUrl);
        setRecording(false);
      });
    }
    setDuration((new Date().getTime() - duration) / 1000);
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      mediaChunksRef.current.push(event.data);
    }
  };

  const handleRecordingStop = () => {
    if (mediaChunksRef.current.length > 0) {
      const audioBlob = new Blob(mediaChunksRef.current, {
        type: "audio/webm",
      });
      const downloadUrl = URL.createObjectURL(audioBlob);
      setBlobUrl(downloadUrl);
    }
    setRecording(false);
  };

  return ReactDOM.createPortal(
    <>
      <div className="font-roboto fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="flex flex-col w-[540px] bg-white p-4 rounded-lg">
          <h3 className="font-bold bg-slate-400 text-neutral-200">
            Record Prompt <span> - {language} </span>
          </h3>
          <div className=" mx-2 my-4">
            {recording ? (
              <button
                className="bg-red-500 font-medium text-black rounded-xl px-2 py-1"
                onClick={handleStopRecording}
              >
                <BsRecordCircle className="animate-pulse bg-white" />
                Stop Recording
              </button>
            ) : (
              <button
                className="bg-green-500 font-medium text-black rounded-xl px-2 py-1"
                onClick={handleStartRecording}
              >
                Start Recording
              </button>
            )}
            {blobUrl && (
              <audio controls>
                <source src={blobUrl} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
          <div className="flex flex-row">
            <button
              className="bg-blue-700 text-white text-sm px-2 py-1 m-2 rounded-xl w-64"
              onClick={() => handleSave(false)}
            >
              Save Prompt
            </button>
            <button
              className="bg-blue-700 text-white text-sm px-2 py-1 m-2 rounded-xl w-64"
              onClick={() => handleSave(true)}
            >
              Save to All Languages
            </button>
            <button
              className="bg-blue-700 text-white text-sm px-2 py-1 m-2 rounded-xl w-64"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.getElementById("recorderPortal") as Element | DocumentFragment
  );
};

export default Recorder;
