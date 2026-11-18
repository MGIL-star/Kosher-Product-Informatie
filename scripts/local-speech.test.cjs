const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(){
 const workers=[],tracks=[],recorders=[],timers=new Map();let clock=0;
 class Worker{constructor(){workers.push(this);}postMessage(message){this.messages??=[];this.messages.push(message);if(message.type==='load')queueMicrotask(()=>this.onmessage({data:{type:'ready'}}));if(message.type==='transcribe')queueMicrotask(()=>this.onmessage({data:{type:'result',text:'twee pakken melk'}}));}terminate(){this.terminated=true;}}
 class Recorder{static isTypeSupported(){return true;}constructor(){recorders.push(this);this.mimeType='audio/webm';this.state='inactive';}start(){this.state='recording';}stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['audio'])});this.onstop?.();}}
 class Context{async decodeAudioData(){return{sampleRate:48000,length:4800,numberOfChannels:1,getChannelData:()=>new Float32Array(4800).fill(.1)};}async close(){}}
 const navigator={mediaDevices:{async getUserMedia(){const track={stopped:false,stop(){this.stopped=true;}};tracks.push(track);return{getTracks:()=>[track]};}}};
 const window={Worker,MediaRecorder:Recorder,AudioContext:Context};
 const context={window,Worker,MediaRecorder:Recorder,navigator,document:{baseURI:'https://example.test/catalogus/'},URL,Blob,Float32Array,setTimeout(fn){const id=++clock;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},queueMicrotask};
 vm.runInNewContext(fs.readFileSync('catalogus/local-speech.js','utf8'),context);
 return{Class:window.CatalogLocalSpeech,workers,tracks,recorders,timers};
}
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
test('audio is resampled to 16 kHz mono with consistent amplitude',()=>{
 const h=harness();const result=h.Class.resample({sampleRate:48000,length:48000,numberOfChannels:2,getChannelData:i=>new Float32Array(48000).fill(i===0?.25:.75)});assert.equal(result.length,16000);assert.equal(result[0],.5);assert.equal(result.at(-1),.5);
});
test('local recorder transcribes through worker and releases microphone',async()=>{
 const h=harness(),engine=new h.Class();assert(engine.supported());await engine.load(()=>{});let transcript='';await engine.start({onStart(){},onStatus(){},onResult:text=>transcript=text,onError:message=>assert.fail(message)});engine.finish();await settle();await new Promise(r=>setImmediate(r));await settle();assert.equal(transcript,'twee pakken melk');assert(h.tracks[0].stopped);const message=h.workers[0].messages.find(m=>m.type==='transcribe');assert(message.audio instanceof Float32Array);assert.equal(message.audio.length,1600);assert.equal(engine.listening,false);
});
test('cancel closes microphone and terminates local worker',async()=>{
 const h=harness(),engine=new h.Class();await engine.load(()=>{});await engine.start({onStart(){},onStatus(){},onResult:()=>assert.fail('cancelled result'),onError:()=>assert.fail('cancelled error')});engine.cancel();await settle();assert(h.tracks[0].stopped);assert(h.workers[0].terminated);assert.equal(engine.ready,false);assert.equal(engine.listening,false);assert.equal(h.timers.size,0);
});
