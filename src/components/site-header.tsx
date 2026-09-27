import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from './brand';
import { supabase } from '@/integrations/supabase/client';
const links = [['Markets','/markets'],['Copy trading','/copy-trading'],['Pricing','/pricing'],['About','/about']] as const;
export function SiteHeader() {
  const [open,setOpen]=useState(false); const [signed,setSigned]=useState(false);
  useEffect(()=>{supabase.auth.getUser().then(({data})=>setSigned(!!data.user)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSigned(!!session)); return ()=>subscription.unsubscribe()},[]);
  return <header className="site-header"><div className="site-header-inner"><Brand/><nav className="hidden items-center gap-8 lg:flex">{links.map(([label,to])=><Link key={to} to={to} className="nav-link">{label}</Link>)}</nav><div className="hidden items-center gap-3 lg:flex"><Button variant="ghost" asChild><Link to={signed?'/dashboard':'/auth'}>{signed?'Dashboard':'Log in'}</Link></Button><Button asChild className="h-10 px-5"><Link to={signed?'/dashboard':'/auth'} search={signed?undefined:{mode:'register'}}> {signed?'Go to account':'Open an account'} <ArrowUpRight/></Link></Button></div><Button size="icon" variant="ghost" className="lg:hidden" onClick={()=>setOpen(!open)} aria-label={open?'Close menu':'Open menu'}>{open?<X/>:<Menu/>}</Button></div>{open&&<nav className="mobile-menu">{[...links,['FAQ','/faq'],['Contact','/contact'],['Log in','/auth']].map(([label,to])=><Link key={to} to={to as '/markets'} onClick={()=>setOpen(false)}>{label}</Link>)}</nav>}</header>
}
