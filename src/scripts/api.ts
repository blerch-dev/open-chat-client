import { sleep } from "./util";

export interface Session {
    user?: any,
    cache_time: number
}

// Will use cached results for 2nd params minutes, or can be forced to refresh
export async function FetchSession(name: string, forceRemote = false, longestCache = 5, loops = 0): Promise<Session> {
    if(forceRemote === true) { return await RemoteFetchSession(); }

    let fetching = sessionStorage.getItem("fetching_remote_session") === 'true';
    if(fetching ?? false) {
        await sleep(1000);
        return await FetchSession(name, forceRemote, longestCache, loops + 1); 
    }

    let cache = sessionStorage.getItem('remote_session') as any;
    if(cache === null) { return await RemoteFetchSession(); }
    
    cache = JSON.parse(cache) as Session;
    if(Date.now() - cache.cache_time > longestCache * 1000) { return await RemoteFetchSession(); }
    return cache;
}

async function RemoteFetchSession() {
    sessionStorage.setItem("fetching_remote_session", 'true');
    let session_remote = await (await fetch('http://localhost:8000/user/me')).json(); // needs standardized url, localhost for now
    const session = { ...session_remote, cache_time: Date.now() }
    sessionStorage.setItem("remote_session", JSON.stringify(session));
    sessionStorage.setItem("fetching_remote_session", 'false');
    return session;
}