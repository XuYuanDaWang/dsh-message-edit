const fs=require('node:fs'); const vm=require('node:vm'); const assert=require('node:assert/strict');
const source=fs.readFileSync('/Volumes/许愿大王の工作盘/07-杂项/dsh-message-edit/client.js','utf8');
async function scenario(turnNo, failOnce=false) {
 let plugin, registered, states=[], refs=[], cursor=0, view, stopped=0, prompts=[], forks=[], opened=[], creates=0;
 const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),useMemo:f=>f(),useState(initial){let i=cursor++; if(!(i in states))states[i]=initial;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v]},useRef(initial){let i=cursor++;if(!(i in refs))refs[i]={current:initial};return refs[i]},useEffect(){}};
 const session={getSnapshot:()=>({running:stopped===0}),cancel:async()=>{stopped++;return {ok:true}}};
 const childSession={prompt:async(content,mode,signal,id)=>{prompts.push({content,mode,id});if(failOnce&&prompts.length===1)throw Error('network');return {ok:true}}};
 const ctx={effect(){},locale:{register(){}},slots:{inject(k,f){f()},register(o,c){registered=c}},get(){},sessions:{binding:()=>({session}),fork:async o=>{forks.push(o);return 'fork'},using:async(id,o,f)=>f({binding:{session:childSession}})},uiWorkspace:{connectWorkspace:async()=>{creates++;return 'new'},openSession:id=>opened.push(id)}};
 vm.runInNewContext(source,{window:{__ModuleLoader__:{load:o=>plugin=o.factory(()=>React)},clearTimeout,setTimeout},navigator:{language:'zh-CN'},Intl,crypto:{randomUUID:()=> 'request-1'}});
 plugin.apply(ctx);
 const props={node:{data:{content:[{type:'text',text:'original'}]},location:{kind:'step',turn:{turn:turnNo,start:{seq:20}}}},sessionId:'source',useSession:f=>f({subagent:null}),useSessions:f=>f({byId:{source:{projectionValues:{agentPreset:'standard'}}}}),useWorkspaces:f=>f({items:[{workspaceId:'workspace',sessionIds:['source']}]}),renderFactorySlot:()=>null,t:k=>k};
 function render(){cursor=0;const wrapper=registered(props);view=wrapper.type(wrapper.props);return view}
 function all(e){return !e||typeof e!=='object'?[]:[e,...(e.props?.children||[]).flat(Infinity).flatMap(all)]}
 render();await all(view).find(x=>x.props?.['aria-label']==='edit').props.onClick();assert.equal(stopped,1);
 render();all(view).find(x=>x.type==='textarea').props.onChange({target:{value:'  revised text  '}});render();
 const send=()=>all(view).find(x=>x.type==='button'&&x.props.children.includes('send')).props.onClick();
 await send();if(failOnce){render();assert(all(view).some(x=>x.props?.role==='alert'));await send()}
 assert.equal(prompts.at(-1).content[0].text,'  revised text  ');assert.deepEqual(opened,[''+(turnNo>1?'fork':'new')]);assert.equal(forks.length,turnNo>1?1:0);assert.equal(creates,turnNo>1?0:1);if(turnNo>1)assert.equal(forks[0].atSeq,19);assert(prompts.every(x=>x.id==='request-1'));return {turnNo,failOnce,stopped,promptAttempts:prompts.length,branches:forks.length,created:creates};
}
(async()=>{console.log(await scenario(1));console.log(await scenario(2));console.log(await scenario(2,true));console.log('All handler regression tests passed')})().catch(e=>{console.error(e);process.exitCode=1});
