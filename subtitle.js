let request=require("request");
let fs=require("fs");
let cheerio=require("cheerio");
let puppeteer = require("puppeteer");
let extract= require("extract-zip")
let sourceDirectory=process.argv[2];
let moviefiles=fs.readdirSync(sourceDirectory);
let movieNames=[];
let count=0;
for(let i=0;i<moviefiles.length;i++)
{
    let ch=moviefiles[i].split(".");
    movieNames.push(ch[0]);
}
for(let i=0; i<movieNames.length;i++)
{
    // console.log("movie  "+movieNames[i]);
let movieName=movieNames[i].split(" ");
let finalURL="https://yts-subs.com/search/";
for(let i=0;i<movieName.length;i++)
{
    finalURL+=(movieName[i]+"%20");
}
// console.log(finalURL);
request(finalURL,function(err,res,html){
    if(err===null&&res.statusCode===200)
    {
        // console.log("page found successfully");
        parsehtml(html,movieNames[i],finalURL);
        // console.log("DONE             DOEN D               ONE            DONE DONE")
        // copySubtitleandExtract(movieNames.length);
    }
    else if(res.statusCode==404)
        console.log("Invalid url");
    else
        console.log(err);        
})
}

// console.log("-------------------------------------------------------______________________")
function parsehtml(html,m,url)
{
    // console.log("Isnisde parse html");
    let d= cheerio.load(html);
    let movies=d(".media-body")
    // console.log(movies.length)
    let i;
    for(i=0;i<movies.length;i++)
    {
        let MName=d(d(movies[i]).find("a h3")).text();
        // console.log(MName);
        if(MName.toLowerCase()==m.toLowerCase())
        {
            // console.log("Movie found at  "+i);;
            break;
        }   
    }
    if(i!=movies.length)
    downloadSubtitle(i,url);
    else
    console.log("Movie not present in the database of yify subtitles")
} 


async function downloadSubtitle(i,url)
{
    // console.log("inside downloadsubtitle function")
    try
    {
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
      });
      let pages = await browser.pages();
      let page = pages[0];
    
      await page.goto(url,{ waitUntil: "networkidle0" });
      await page.waitForSelector(".media-body", { visible: true })
      let movieList=await page.$$(".media-body")

    //   await Promise.all(
    //     [page.waitForNavigation({ waitUntil: "networkidle0" }),
    //     movieList[i].click()]);
        await movieList[i].click()
        await page.waitForNavigation({waitUntil: "networkidle0"});  

      await page.waitForSelector(".table-responsive", {visible:true});
      let languageList=await page.$$(".table tbody .flag-cell .sub-lang");
      let ele=await page.$$(".table tbody td a .text-muted");
      for(let i=0;i<languageList.length;i++)
      {
        let language=languageList[i];  
        const text = await page.evaluate(language => language.textContent, language);
        if(text=="English")
        { 
            await ele[i].click();
            await page.waitForNavigation({waitUntil: "networkidle0"});
            // console.log("English clicked");
            await page.waitForSelector(".title");
            await page.click(".title");
            // console.log("download button clicked");
            break;
         }
      }

    await page.waitFor(10000)
    // console.log("hopefully subtitle has been downloaded")  
    browser.close();
    count++;
    copySubtitleandExtract(count)
    }
    catch(e){
        // console.log("bada catch");
        console.log("Subtitle not downlaoded")
        console.log(e);
        
    }
}



function copySubtitleandExtract(c)
{
    if(c==moviefiles.length){
// console.log(count);
    // console.log("Inside copyandextract function")
    let dir = "C:\\Users\\Anshuman\\Downloads\\"; 
    let files = fs.readdirSync(dir);
    files.sort(function(a, b) {
        return fs.statSync(dir + a).mtime.getTime() - 
               fs.statSync(dir + b).mtime.getTime();
    });
    let i=files.length-1;
    while(count!=0)
    {
        let src="C:\\Users\\Anshuman\\Downloads\\"+files[i];
        let dest=sourceDirectory+"\\"+files[i];
        // console.log(src+"\n"+dest);
        fs.copyFileSync(src, dest);
        let zipfile= dest;
        extract(zipfile, {dir : sourceDirectory}, function(err){
            console.log(err);
        })
        i--;
        count--;
    }
    // console.log("Hopefully subtiles has been extracted");
}
else 
return ;  

}