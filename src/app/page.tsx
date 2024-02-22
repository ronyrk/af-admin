"use client";
import { UploadButton } from "@/lib/uploadthing";
import toast from "react-hot-toast";
import { useState } from "react";


export default function Home() {
  const [image, setImage] = useState<string>()
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res[0].url);
          for (const file of res) {
            console.log(file.url, "single")
          }
          toast.success("Image Upload successfully")
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          toast.error(error.message);
        }}
      />
    </main>
  );
}