import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let transcriber;
self.onmessage=async event=>{
  try{
    if(event.data.type==='load'){
      transcriber=await pipeline('automatic-speech-recognition','onnx-community/whisper-tiny',{
        revision:'ff4177021cc41f7db950912b73ea4fdf7d01d8e7',dtype:'q8',device:'wasm',
        progress_callback:progress=>self.postMessage({type:'progress',progress})
      });
      self.postMessage({type:'ready'});
    }else if(event.data.type==='transcribe'){
      if(!transcriber)throw Error('Not loaded');
      const result=await transcriber(event.data.audio,{language:'dutch',task:'transcribe',max_new_tokens:64});
      self.postMessage({type:'result',text:result.text||''});
    }
  }catch{self.postMessage({type:'error'});}
};
