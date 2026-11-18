import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let transcriber;
self.onmessage=async event=>{
  try{
    if(event.data.type==='load'){
      transcriber=await pipeline('automatic-speech-recognition','onnx-community/whisper-base',{
        revision:'27a07b4b52b3a4c5886134bb4320e93e1a4bbc7c',dtype:'q8',device:'wasm',
        progress_callback:progress=>self.postMessage({type:'progress',progress})
      });
      self.postMessage({type:'ready'});
    }else if(event.data.type==='transcribe'){
      if(!transcriber)throw Error('Not loaded');
      const languages={nl:'dutch',fr:'french',en:'english',iw:'hebrew',he:'hebrew'};
      const language=languages[event.data.language]||languages.nl;
      const result=await transcriber(event.data.audio,{language,task:'transcribe',max_new_tokens:64});
      self.postMessage({type:'result',text:result.text||''});
    }
  }catch{self.postMessage({type:'error'});}
};
