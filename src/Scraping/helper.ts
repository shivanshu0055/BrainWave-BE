import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import axios from 'axios';
puppeteer.use(StealthPlugin());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

dayjs.extend(utc);
dayjs.extend(timezone);

const x = dayjs().tz('Asia/Kolkata');

export function getTime(){
    return x.format('HH:mm:ss')
}

export function getDate(){
    return x.format('DD-MM-YYYY')
}

type memoryInfoType={
    title?:string
    description?:string
    creatorName?:string
}

export async function createEmbeddings(memoryInfo:memoryInfoType){
    const input = `
        ${memoryInfo.title ?? "N/A"}
        ${memoryInfo.description ?? "N/A"}
        ${memoryInfo.creatorName ? `Creator: ${memoryInfo.creatorName}` : ""}
    `;
    const result = await model.embedContent(input.trim());
    // console.log(result.embedding);
    return result.embedding.values
}

export async function createQueryEmbeddings(query:string){
    const result = await model.embedContent(query.trim());
    return result.embedding.values
}

export function cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, v1, i) => sum + v1 * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
    return dotProduct / (magnitude1 * magnitude2);
}

export async function giveYoutubeInfo(link:string){
    const id=link.split('=')[1]
    const apiKey=process.env.YOUTUBE_API_KEY
    const res=await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${apiKey}&part=snippet`)
    const data=res.data
    // console.log(res.data.items[0].snippet);
    
    const title=data.items[0].snippet.title
    const description=data.items[0].snippet.description
    const channelName=data.items[0].snippet.channelTitle
    // console.log(description);
    
    return {title,description,channelName}
}

export async function giveTweetInfo(link:string){
    const browser = await puppeteer.launch({
        headless: true,  // Faster headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Speeds up execution
    });

    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(link, { waitUntil: "domcontentloaded" });

    // const tweet=await page.evaluate(()=>{
    //     const tweetTextDiv= document.querySelector('div[data-testid="tweetText"]');
    //     const usernameTextDiv= document.querySelector('div[data-testid="User-Name"]');
    //     //@ts-ignore
    //     return {tweetText:tweetTextDiv.innerText,username:usernameTextDiv.innerText}
    // })
    // await new Promise((r)=>setTimeout(r,5000))
    await page.waitForSelector('div[data-testid="tweetText"]', {visible: true})
    await page.waitForSelector('div[data-testid="User-Name"]', {visible: true})
    const tweet=await page.$eval('div[data-testid="tweetText"]',el=>el.innerText).catch(()=>"N/A")
    const username=await page.$eval('div[data-testid="User-Name"]',el=>el.innerText).catch(()=>"N/A")
    // console.log(tweet);
    console.log(tweet);
    
    await browser.close();
    return {description:tweet,creatorName:username}
    
}

export async function giveWebsiteInfo(link:string){
    
    const browser = await puppeteer.launch({
        headless: true,  // Faster headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Speeds up execution
    });

    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(link, { waitUntil: "domcontentloaded" });

    // const info=await page.evaluate(()=>{
    //     const title= document.title
    //     const descriptionTag = document.querySelector('meta[name="description"]')
    //     const description=descriptionTag?.getAttribute('content')
    //     const logoUrlTagOption1=document.querySelector('meta[property="og:image"]')
    //     const logoUrl1=logoUrlTagOption1?.getAttribute('content')
    //     const logoUrlTagOption2=document.querySelector('meta[name="twitter:image"]')
    //     const logoUrl2=logoUrlTagOption2?.getAttribute('content')
    //     // console.log(descriptionTag);
    //     // console.log("Hello");
    //     return {title,description:description||"N/A",logoUrl:logoUrl1||logoUrl2||"N/A"}
    // })

    const titlee=await page.title()
    const descriptionn=await page.$eval('meta[name="description"]',el=>el.content).catch(()=>"N/A")
    const logoUrl1=await page.$eval('meta[name="og:image"',el=>el.content).catch(()=>undefined)
    const logoUrl2=await page.$eval('meta[name="twitter:image"',el=>el.content).catch(()=>undefined)
    // console.log(info.title);
    // console.log(info.description);
    // console.log(info.logoUrl);

    console.log(descriptionn);
    console.log(logoUrl1||logoUrl2||"N/A");
    console.log(titlee);
    
    await browser.close()
    return {title:titlee,description:descriptionn,logoUrl:logoUrl1||logoUrl2||"N/A"}
}
