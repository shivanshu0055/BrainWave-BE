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
    
    const title=data.items[0].snippet.title
    const description=data.items[0].snippet.description
    const channelName=data.items[0].snippet.channelTitle
    
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

    await page.waitForSelector('div[data-testid="tweetText"]', {visible: true})
    await page.waitForSelector('div[data-testid="User-Name"]', {visible: true})
    const tweet=await page.$eval('div[data-testid="tweetText"]',el=>el.innerText).catch(()=>"N/A")
    const username=await page.$eval('div[data-testid="User-Name"]',el=>el.innerText).catch(()=>"N/A")
    
    await browser.close();
    return {description:tweet,creatorName:username}
    
}

export async function giveWebsiteInfo(link:string){
    
    const browser = await puppeteer.launch({
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox']  
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

    const titlee=await page.title()
    const descriptionn=await page.$eval('meta[name="description"]',el=>el.content).catch(()=>"N/A")
    const logoUrl1=await page.$eval('meta[name="og:image"',el=>el.content).catch(()=>undefined)
    const logoUrl2=await page.$eval('meta[name="twitter:image"',el=>el.content).catch(()=>undefined)
    
    await browser.close()
    return {title:titlee,description:descriptionn,logoUrl:logoUrl1||logoUrl2||"N/A"}
}
