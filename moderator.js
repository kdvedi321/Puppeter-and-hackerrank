let fs = require("fs");
let puppeteer =  require("puppeteer");
let cFile = process.argv[2];
(async function(){
    let browser = await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        //slowMo:100,
        args:["--start-maximized"]
    });
    // let page = await browser.newPage();
    let pages = await browser.pages();
    let page = pages[0];
    let data = await fs.promises.readFile(cFile);
    let {url, pwd, user} = JSON.parse(data);
    await page.goto(url, {waitUntil: "networkidle0"});
    // let unInputWillBeFoundPromise = page.$("#input-1");
    // let psInputWillBeFoundPromise = page.$("#input-2");
    // let unNpsEl = await Promise,all([unInputWillBeFoundPromise, psInputWillBeFoundPromise]);
    await page.type("#input-1",user);
    await page.type("#input-2",pwd);
    await page.click("button[data-analytics=LoginPassword]");

//**************Dashboard ***********/
await page.waitForNavigation({waitUntil: "networkidle0"});
await waitForLoader(page);
await page.waitForSelector("a[data-analytics=NavBarProfileDropDown]", {visible:true});
await page.click("a[data-analytics=NavBarProfileDropDown]");
await page.click("a[data-analytics=NavBarProfileDropDownAdministration]")
await waitForLoader(page);
// let tabs = await page.$$(".administration header ul li");
// await tabs[1].click();
// let mpUrl = page.url();
let tabs = await page.$$(".administration header ul li a");
let href = await page.evaluate(function(e1){
    return e1.getAttribute("href");
}, tabs[1]);
let mpUrl = "https://www.hackerrank.com/"+href;
//wait until
//wait for selector
let qidx =0;
 while(true){
     let question = await getMeQuestionElement(page, qidx, mpUrl);
     if(question==null){
         console.log("All Question processed");
         return ;
     }
     await handleQuestion(page, question, process.argv[3]);
     qidx++;
 } }) ();

async function getMeQuestionElement(page,qidx,mpUrl){
    let pidx = Math.floor(qidx/10);
    let pQidx = qidx%10;
    // pageVisit
    // pageQuestion
    conosle.log(pidx+" "+pQidx);
    await page.goto(mpUrl);
    await waitForLoader(page);
    await page.waitForSelector("pagination ul li", {visible:true});
    let paginations = await page.$$(".pagination ul li");
    let nxtBtn = paginations[paginations.length-2];
    let className = await page.evaluate(function (e1){
        return e1.getAttribue("class");
    }, nxtBtn);
    for(let i=0;i<pidx;i++){
        if(className == "disabled"){
            return null;
        }
        await nxtBtn.click();
        await page.waitForSelector(".pagination ul li",{visible:true});
        paginations = await page.$$(".pagination ul li");
        nxtBtn = paginations[paginations.length-2];
        className = await page.evaluate(function(e1){
            return e1.getAttribue("class");
        },nxtBtn);
    }
// pageQuestion 
    let challengeList = await page.$$(".backbone.block-center");
    if(challengeList.length > pQidx){
        return challengeList[pQidx];
    }else{
        return null;
    }
    async function waitForLoader(page){
        await page.waitForSelector("#ajax-msg",{
            visible: false
        });
    }
}

async function handleQuestion(page, question, uToAdd){
    let qUrl = await page.evaluate(function(e1){
        return e1.getAttribue("href");
    },question);
    await question.click();
    // await page.goto(qUrl);
    await page.waitForNavigation({waitUntil: "networkidle0"});
    await waitForLoader(page);
    await page.waitForSelector("li[data-tab=moderators]", {visible: true});
    await page.type("#moderator", uToAdd);
    await page.keyboard.press("Enter");
    await page.click(".save-challenge.btn.btn-green");
}