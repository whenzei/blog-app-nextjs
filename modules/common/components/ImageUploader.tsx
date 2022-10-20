import { useState } from "react";
import Loader from "./Loader";
import { STATE_CHANGED, uploadFileToStorage } from "@modules/common/firbase";
import { getDownloadURL } from "firebase/storage";

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    console.log(file);
    const extension = file.type.split("/")[1];
    setUploading(true);
    const task = uploadFileToStorage(extension, file);
    task.on(
      STATE_CHANGED,
      (snapshot: any) => {
        const pct = Number(
          ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)
        );
        setProgress(pct);
      },
      (error: any) => {
        setUploading(false);
        console.log("Hi");
        console.log(error);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(task.snapshot.ref).then((downloadURL: string) => {
          setDownloadURL(downloadURL);
          setUploading(false);
        });
      }
    );
  };

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}</h3>}
      {!uploading && (
        <>
          <label className="btn">
            📷 Upload Image
            <input
              type="file"
              onChange={uploadFile}
              accept="image/x-png,image/gif,image/jpeg"
            />
          </label>
        </>
      )}

      {downloadURL && (
        <code className="upload-snippet">{`![alt](${downloadURL})`}</code>
      )}
    </div>
  );
}
