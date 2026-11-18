(() => {
  'use strict';
  class LocalSpeech {
    constructor(){this.worker=null;this.ready=false;this.listening=false;this.busy=false;this.generation=0;}
    supported(){return Boolean(window.Worker&&navigator.mediaDevices?.getUserMedia&&window.MediaRecorder&&(window.AudioContext||window.webkitAudioContext));}
    load(progress){
      if(this.ready)return Promise.resolve();
      if(this.loading)return this.loading;
      const job=this.generation;
      this.loading=new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{this.cancel();reject(Error('load-timeout'));},180000);
        this.loadReject=reject;
        this.worker=new Worker(new URL('speech-worker.js?v=20261118-1',document.baseURI),{type:'module'});
        this.worker.onmessage=event=>{
          if(job!==this.generation)return;
          const message=event.data;
          if(message.type==='progress')progress(message.progress);
          if(message.type==='ready'){clearTimeout(timer);this.ready=true;this.loading=null;this.loadReject=null;resolve();}
          if(message.type==='result'){this.transcribeResolve?.(message.text);this.transcribeResolve=this.transcribeReject=null;}
          if(message.type==='error'){clearTimeout(timer);this.fail(Error('recognition'));}
        };
        this.worker.onerror=()=>{clearTimeout(timer);this.fail(Error('worker'));};
        this.worker.postMessage({type:'load'});
        this.loadTimer=timer;
      });
      return this.loading;
    }
    fail(error){const rejectLoad=this.loadReject,rejectText=this.transcribeReject;this.loadReject=this.transcribeReject=null;rejectLoad?.(error);rejectText?.(error);this.cancel();}
    async start({onStart,onStatus,onResult,onError}){
      if(!this.ready||this.listening||this.busy)return;
      const token=this.generation;this.listening=true;
      try{
        const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
        if(token!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
        this.stream=stream;
        const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
        const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);this.recorder=recorder;const chunks=[];
        recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
        recorder.onerror=()=>{this.cancel();onError('De opname is mislukt. Probeer opnieuw.');};
        recorder.onstop=async()=>{
          clearTimeout(this.recordTimer);stream.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;this.listening=false;
          if(token!==this.generation)return;
          this.busy=true;onStatus('Uw gesproken boodschappen worden herkend…');
          let context;
          try{
            const Context=window.AudioContext||window.webkitAudioContext;context=new Context();
            const data=await context.decodeAudioData(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer());
            if(token!==this.generation)return;
            const audio=LocalSpeech.resample(data);
            const rms=Math.sqrt(audio.reduce((sum,value)=>sum+value*value,0)/Math.max(1,audio.length));
            if(!audio.length||rms<.003){onError('Ik heb niets verstaan. Spreek opnieuw en houd de microfoon iets dichterbij.');return;}
            const text=await new Promise((resolve,reject)=>{
              this.transcribeResolve=resolve;this.transcribeReject=reject;
              this.inferenceTimer=setTimeout(()=>this.fail(Error('inference-timeout')),90000);
              this.worker.postMessage({type:'transcribe',audio},[audio.buffer]);
            });
            clearTimeout(this.inferenceTimer);if(token===this.generation)onResult(text);
          }catch(error){if(error?.message!=='cancelled')onError('De extra spraakherkenning kon uw opname niet verwerken. Probeer opnieuw of gebruik de dicteerknop op uw toetsenbord.');}
          finally{context?.close().catch(()=>{});if(token===this.generation)this.busy=false;}
        };
        recorder.start();onStart();this.recordTimer=setTimeout(()=>this.finish(),12000);
      }catch(error){if(token===this.generation){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.listening=false;onError(error?.name==='NotAllowedError'?'Sta microfoontoegang toe voor deze website en probeer opnieuw.':'De microfoon kon niet worden geopend. Controleer uw microfoon en probeer opnieuw.');}}
    }
    finish(){if(this.recorder?.state==='recording')this.recorder.stop();}
    cancel(){
      this.generation++;clearTimeout(this.loadTimer);clearTimeout(this.recordTimer);clearTimeout(this.inferenceTimer);
      if(this.recorder){this.recorder.onstop=this.recorder.ondataavailable=this.recorder.onerror=null;if(this.recorder.state==='recording')this.recorder.stop();}
      this.stream?.getTracks().forEach(t=>t.stop());this.stream=this.recorder=null;
      this.worker?.terminate();this.worker=null;this.ready=this.listening=this.busy=false;this.loading=null;
      this.loadReject?.(Error('cancelled'));this.transcribeReject?.(Error('cancelled'));this.loadReject=this.transcribeReject=this.transcribeResolve=null;
    }
    static resample(buffer){
      const length=Math.floor(buffer.length*16000/buffer.sampleRate);const result=new Float32Array(length);
      const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
      // Average each source sample interval when reducing the sample rate.
      for(let i=0;i<length;i++){
        const start=Math.floor(i*buffer.sampleRate/16000),end=Math.max(start+1,Math.floor((i+1)*buffer.sampleRate/16000));let total=0;
        for(let sample=start;sample<Math.min(end,buffer.length);sample++)for(const channel of channels)total+=channel[sample];
        result[i]=total/((Math.min(end,buffer.length)-start)*channels.length);
      }
      return result;
    }
  }
  window.CatalogLocalSpeech=LocalSpeech;
})();
