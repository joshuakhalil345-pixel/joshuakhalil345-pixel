const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
ffmpeg.setFfmpegPath(ffmpegPath);
(async ()=>{
  const videosDir = path.resolve(__dirname, '..', 'videos');
  const files = fs.readdirSync(videosDir).filter(f=>f.endsWith('.webm'));
  if(files.length === 0){
    console.error('No .webm files found in', videosDir); process.exit(1);
  }
  const input = path.join(videosDir, files[files.length-1]);
  const out = path.join(videosDir, path.basename(input, '.webm') + '.mp4');
  console.log('Converting', input, '->', out);
  ffmpeg(input)
    .outputOptions(['-c:v libx264','-crf 23','-preset veryfast','-c:a aac','-b:a 128k'])
    .on('end', ()=>{ console.log('Conversion complete:', out) })
    .on('error', (err)=>{ console.error('ffmpeg error', err) })
    .save(out);
})();
