// import { getVideoDurationInSeconds } from 'get-video-duration';
// import path from 'path';

// export const getVideoDurationFromBufferAlt = async (buffer: Buffer): Promise<string> => {
//   const { writeFile, mkdir, unlink } = await import('fs/promises');
//   const tempDir = path.join(process.cwd(), 'tmp');
//   const tempFilePath = path.join(tempDir, `temp-video-${Date.now()}.mp4`);

//   await mkdir(tempDir, { recursive: true });
//   await writeFile(tempFilePath, buffer);

//   try {
//     const duration = await getVideoDurationInSeconds(tempFilePath);
//     const hours = Math.floor(duration / 3600);
//     const minutes = Math.floor((duration % 3600) / 60);
//     const seconds = Math.floor(duration % 60);
//     return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   } finally {
//     await unlink(tempFilePath).catch(() => {});
//   }
// };
