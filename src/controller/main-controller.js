const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");

class MainController {
  constructor() {
    this.init();
  }

  init() {
    this.window = new BrowserWindow({
      transparent: true,
      show: false,
      width: 1920,
      height: 1080,
      frame: true,
      autoHideMenuBar: true,
      resizable: true,
      icon: path.join(__dirname, "./static/favicon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "./src/controller/preload.js"),
        webSecurity: false,
        nodeIntegration: false,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    // 是否打开开发工具
    // this.window.webContents.openDevTools();

    this.window.loadURL("https://www.kookapp.cn/app/login", {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.52",
    });

    this.window.webContents.on("dom-ready", () => {
      //   this.window.webContents.insertCSS(CssInjector.login);
      //   this.window.webContents.insertCSS(CssInjector.main);
      //   this.addFontAwesomeCDN();
      this.changeTitle();
      //   this.addToggleContactElement();
      //   this.addUnreadMessageListener();
      this.show();
    });
    // this.window.webContents.on("did-finish-load", () => {
    //   console.log("finish");
    // });

    this.window.webContents.on("did-fail-load", () => {
      console.log("----fail-----");
      this.window.reload();
    });

    // triggering when user try to close the play window.
    this.window.on("close", () => {
      // if (this.window.isVisible()) {
      //     e.preventDefault();
      //     this.window.hide();
      // }
      this.window.destroy();
      this.window = null;
      //fix windows hide change quit
    });

    this.window.on("closed", () => {
      // if (this.window.isVisible()) {
      //     e.preventDefault();
      //     this.window.hide();
      // }
      this.window.destroy();
      this.window = null;
      //fix windows hide change quit
    });

    // this.window.webContents.setWindowOpenHandler(this.openInBrowser);

    ipcMain.on("resizeWindow", (event, value) => {
      if (value === "desktop") {
        this.window.setSize(1000, this.window.getSize()[1], true);
      } else {
        this.window.setSize(450, this.window.getSize()[1], true);
      }
    });
  }

  show() {
    this.window.show();
    this.window.focus();
  }

  toggle() {
    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.show();
    }
  }

  openInBrowser(e, url) {
    e.preventDefault();
    // if the url start with a WeChat redirect url, get the real url, decode and open in external browser
    let redirectUrl = url;
    if (
      url.startsWith(
        "https://open.weixin.qq.com/connect/qrconnect?response_type=code&appid="
      )
    ) {
      const redirectRegexp =
        /https:\/\/open\.weixin\.qq\.com\/cgi-bin\/mmwebwx-bin\/webwxcheckurl\?requrl=(.*)&skey.*/g;
      redirectUrl = decodeURIComponent(redirectRegexp.exec(url)[1]);
    }
    shell.openExternal(redirectUrl);
  }

  // handleRequest(details) {
  //     // console.log(details.url)
  //     details.url.startsWith("https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit") &&
  //     this.login();
  //     details.url.startsWith(
  //         "https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit"
  //     ) && this.login();
  //     details.url.startsWith("https://wx.qq.com/?&lang") && this.logout();
  //     details.url.startsWith("https://wx2.qq.com/?&lang") && this.logout();
  // }
  //
  // login() {
  //     this.window.hide();
  //     this.window.setSize(1000, 800, true);
  //     this.window.setResizable(true);
  //     this.window.show();
  // }
  //
  // logout() {
  //     this.window.setSize(380, 500, true);
  // }

  // addFontAwesomeCDN() {
  //     this.window.webContents.executeJavaScript(`
  //         let faLink = document.createElement('link');
  //         faLink.setAttribute('rel', 'stylesheet');
  //         faLink.type = 'text/css';
  //         faLink.href = 'https://use.fontawesome.com/releases/v5.0.13/css/all.css';
  //         faLink.integrity = 'sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp';
  //         faLink.crossOrigin = 'anonymous';
  //         document.head.appendChild(faLink);
  //     `);
  // }

  changeTitle() {
    this.window.webContents.executeJavaScript(`
            var titleName = 'Kook (version: ${app.getVersion()})';
            document.title = titleName;
            new MutationObserver(mutations => {
                if (document.title !== titleName) {
                    document.title = titleName;
                }
            }).observe(document.querySelector('title'), {childList: true});
        `);
  }

  // addUnreadMessageListener() {
  //     this.window.webContents.executeJavaScript(`
  //         new MutationObserver(mutations => {
  //             let unread = document.querySelector('.icon.web_wechat_reddot');
  //             let unreadImportant = document.querySelector('.icon.web_wechat_reddot_middle');
  //             let unreadType = unreadImportant ? 'important' : unread ? 'minor' : 'none';
  //             require('electron').ipcRenderer.send('updateUnread', unreadType);
  //         }).observe(document.querySelector('.chat_list'), {subtree: true, childList: true});
  //     `);
  // }
  //
  // addToggleContactElement() {
  //     this.window.webContents.executeJavaScript(`
  //         let toggleButton = document.createElement('i');
  //         toggleButton.className = 'toggle-mobile-button fas fa-mobile-alt';
  //         toggleButton.onclick = () => {
  //             if (toggleButton.classList.contains('mini')) {
  //                 toggleButton.className = 'toggle-mobile-button fas fa-mobile-alt';
  //                 require('electron').ipcRenderer.send('resizeWindow', 'desktop');
  //             } else {
  //                 toggleButton.className = 'toggle-mobile-button fas fa-desktop mini';
  //                 require('electron').ipcRenderer.send('resizeWindow', 'mobile');
  //             }
  //
  //             document.querySelector('div.main').classList.toggle('mini');
  //         };
  //         let titleBar = document.querySelector('.header');
  //         titleBar.appendChild(toggleButton);
  //     `);
  // }
}

module.exports = MainController;
