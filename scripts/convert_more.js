const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
ffmpeg.setFfmpegPath(ffmpegPath);
(async ()=>{
  const videosDir = path.resolve(__dirname, '..', 'videos');
  const files = fs.readdirSync(videosDir).filter(f=>f.endsWith('.mp4'));
  if(files.length === 0){
    console.error('No .mp4 files found in', videosDir); process.exit(1);
  }
  const input = path.join(videosDir, files[files.length-1]);
  const outShort = path.join(videosDir, 'valentine-reveal-short.mp4');
  const outGif = path.join(videosDir, 'valentine-reveal.gif');
  console.log('Trimming', input, '->', outShort);
  // trim to first 6 seconds
  await new Promise((res, rej)=>{
    ffmpeg(input).setStartTime(0).setDuration(6).outputOptions(['-c:v libx264','-crf 20','-preset veryfast','-c:a aac','-b:a 128k']).on('end', ()=>{res()}).on('error', e=>rej(e)).save(outShort)
  })
  console.log('Converting trimmed to GIF', outGif)
  // create GIF from trimmed mp4
  await new Promise((res,rej)=>{
    ffmpeg(outShort).outputOptions(['-vf fps=15,scale=720:-1:flags=lanczos','-gifflags -transdiff']).on('end', ()=>{res()}).on('error', e=>rej(e)).save(outGif)
  })
  console.log('Done; outputs:', outShort, outGif)
})();
