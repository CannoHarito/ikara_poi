/*ikara_poi.js iKaraっぽい。ver.0.00.2 菅野ハリト 詳細はikara_poi.htmlを参照*/
var state=false, ie, dom_description, dom_lyrics, iTunes, fso;
var html="ikara_poi.html";
var lyricmaster = false;
lyricmaster = 'C:\\Windows\\System32\\wscript.exe "C:\\Program_Free\\Lyrics Master\\ExtSupport.js" multi "[title]" "[artist]"';
/*↑上の行を書き換え、先頭の「//」を消す*/

function ITEvent_OnPlayerPlayEvent(track){//曲の開始
    if(!state)return;
     display_lyrics(track);
}

function ITEvent_OnQuittingEvent(){
    //    log("iTunes:終了:正常に終了しました");
    state=false;
}
function ITEvent_OnAboutToPromptUserToQuitEvent(){
    //    log("iTunes:Error:手動で終了されようとしました");
    iTunes.Quit();
}

function display_lyrics(track){
    if(!track){
        dom_lyrics.innerHTML = "No lyrics";
        return;
    }
    dom_description.innerHTML = "<ul><li class='name'>"+track.Name+"</li>"
        +"<li class='artist'>"+track.Artist+"</li>"
        +"<li class='album'>"+track.Album+"</li></ul>";
    dom_lyrics.innerHTML= track.Lyrics.replace(/\r/g,"<br>");

    var newScript=ie.document.createElement("script");
    newScript.type = "text/javascript";
    newScript.text = "startScroll("+track.Lyrics.split(/\r/).length+","+track.Duration+","+iTunes.PlayerPosition+");";
//    WScript.Echo(newScript.text);
    dom_lyrics.appendChild(newScript);
}
function IE_BeforeQuit(){
    state=false;
    //ie.Quit();
    ie=null;
}
function waitIE(){    
    while( ie.Busy || ie.readystate != 4 ){
        WScript.Sleep(100);
    }
}
try{
fso = WScript.CreateObject("Scripting.FileSystemObject");
html = fso.BuildPath(fso.GetParentFolderName(WScript.ScriptFullName) ,html);
ie = WScript.CreateObject("InternetExplorer.Application");
ie.Navigate(html);
waitIE();
dom_description = ie.document.getElementById("description");
dom_lyrics = ie.document.getElementById("lyrics");
if(lyricmaster){
    var btn = ie.document.createElement("input");
    btn.type = "button";
    btn.value = "Lyric Master";
    btn.id = "lyricmaster";
    ie.document.getElementById("message").appendChild(btn);
}

iTunes = WScript.CreateObject("iTunes.Application","ITEvent_");
ie.document.body.onbeforeunload = IE_BeforeQuit;
ie.document.onmousedown = function (e){
    //WScript.Echo("mousedown:"+e.button);
    if(e.button==1)display_lyrics(iTunes.CurrentTrack);
};
if(lyricmaster){
    ie.document.getElementById("lyricmaster").onclick = function(){
        var track=iTunes.CurrentTrack;
        WScript.CreateObject("WScript.Shell").Run(lyricmaster.replace(/\[artist\]/g,track.Artist).replace(/\[title\]/g,track.Name),0,false);
    };
    //WScript.Echo("ok");

}
ie.Visible = true;
state=true;
if(iTunes.PlayerState != 0){
    display_lyrics(iTunes.CurrentTrack);
}else display_lyrics(false);


while(state){
    WScript.Sleep(1000);
}
if(ie)ie.Quit();
ie = null;
iTunes = null;
} catch (x) {
    try{
        if(ie)ie.quit();
    } catch (x) {

    }
    WScript.Echo(x.message);
}