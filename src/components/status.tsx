export function Status({value}:{value:string}){return <span className={'status status-'+value}>{value.replaceAll('_',' ')}</span>}
export function Empty({title,body}:{title:string,body:string}){return <div className="empty"><div className="empty-icon">✳</div><h3 className="mt-4 font-display text-lg">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p></div>}
