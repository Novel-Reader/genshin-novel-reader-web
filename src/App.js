import React, { useState, useEffect, useCallback } from "react";
import Cookies from 'js-cookie';
import intl from "react-intl-universal";
import MainPanel from "./features/main-panel";
import Navs from "./features/navs";
import Settings from "./features/settings";
import LocalAPI from "./shared/api/local-api";
import { isSameObject, loadExample, isMobile } from "./shared/utils";
import { getLocalValue, setLocalValue, NOVEL_READER_STYLE_SAVE_KEY } from "./shared/utils/store";
import { isUp, isDown } from "./shared/utils/hotkey";
import { convertNovel2Pages, convertNovel2Paragraph, checkParaGraph, parseNovel } from "./shared/utils/parse";
import { DEFAULT_STYLE, PAGES, PARAGRAPHS } from "./shared/utils/constants";
import { AppContext } from "./context";
import toaster from "./shared/components/toast";
import File from './shared/model/file';

import "./shared/i18n/index.js";
import "./shared/styles/App.less";

const App = ({ 
  mode = 'offline',
  server = '',
}) => {
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [isMobileDevice] = useState(isMobile);
  const [isShowRightPanel, setIsShowRightPanel] = useState(!isMobileDevice);
  const [isShowLeftPanel, setIsShowLeftPanel] = useState(!isMobileDevice);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [api, setApi] = useState(null);
  const [user, setUser] = useState(null);
  
  const initDataFromLocalStore = useCallback(() => {
    getLocalValue(NOVEL_READER_STYLE_SAVE_KEY).then((localStyleStr) => {
      if (localStyleStr) {
        setStyle(JSON.parse(localStyleStr) || DEFAULT_STYLE);
      }
    });
  }, []);

  const changePageIndex = useCallback((newPageIndex) => {
    setCurrentPageIndex(newPageIndex);
  }, []);

  const initFromServer = useCallback(async () => {
    const username = Cookies.get("username");
    const newApi = new LocalAPI();
    newApi.init({
      server: server,
      token: Cookies.get("novelToken"),
    });

    try {
      if (username) {
        const userResponse = await newApi.getUserInfo(username);
        const userInfo = userResponse.data[0];
        if (!userInfo) throw new Error('User account was not returned by the server');
        newApi.setUserInfo({ user_id: userInfo.id, username });
        const booksResponse = await newApi.getUserBookList(userInfo.id);
        let fileList = booksResponse.data.map(file => new File(file));
        if (fileList.length === 0) {
          fileList = loadExample().map((file) =>
            Object.assign(new File(file), parseNovel(file.detail))
          );
        }
        setUser(userInfo);
        setFiles(fileList);
        setCurrentFileIndex(0);
        setCurrentFile(fileList[0]);
      }
      setApi(newApi);
      return true;
    } catch (err) {
      console.log(err);
      setApi(null);
      setUser(null);
      toaster.danger(intl.get('Error, please try again'));
      return false;
    }
  }, [server]);

  const onKeydown = useCallback((e) => {
    if (isUp(e)) {
      if (document.activeElement.nodeName.toLowerCase() !== 'body') return;
      e.preventDefault();
      if (currentPageIndex === 0) {
        toaster.closeAll();
        toaster.warning(intl.get('This is already the first page'));
        return;
      }
      changePageIndex(currentPageIndex - 1);
    } else if (isDown(e)) {
      if (document.activeElement.nodeName.toLowerCase() !== 'body') return;
      e.preventDefault();
      const file = files[currentFileIndex];
      const maxIndex = file.detail.length - 1;
      if (currentPageIndex === maxIndex) {
        toaster.closeAll();
        toaster.warning(intl.get('This is already the last page'));
        return;
      }
      changePageIndex(currentPageIndex + 1);
    }
  }, [files, currentFileIndex, currentPageIndex, changePageIndex]);

  useEffect(() => {
    if (mode === "online") {
      initFromServer();
    } else {
      toaster.success(intl.get("Welcome_to_use_offline_mode"));
    }
    initDataFromLocalStore();
  }, [mode, initDataFromLocalStore, initFromServer]);

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [onKeydown]);

  const changeMode = useCallback((mode) => {
    if (!currentFile) return;
    
    let detail = currentFile.detail;
    if (Array.isArray(detail)) {
      detail = detail.join(' ');
    } else if (typeof detail !== 'string') {
      detail = 'Article data structure is not correct, please reupload or re-download this article.';
    }
    if (mode === PAGES) {
      setCurrentFile(Object.assign({}, currentFile, convertNovel2Pages(detail)));
      setIsShowRightPanel(true);
    } else if (mode === PARAGRAPHS) {
      if (checkParaGraph(detail)) {
        setCurrentFile(Object.assign({}, currentFile, convertNovel2Paragraph(detail)));
        setIsShowRightPanel(true);
      } else {
        toaster.warning(intl.get('Paragraph not found, Paragraph mode not supported'));
      }
    }
  }, [currentFile]);

  const addFile = useCallback((file) => {
    setFiles(prevFiles => [...prevFiles, file]);
  }, []);

  const showNovel = useCallback(() => {
    if (isMobileDevice) {
      setIsShowRightPanel(false);
      setIsShowLeftPanel(false);
    }
  }, [isMobileDevice]);

  const handleChangeFileIndex = useCallback((newFileIndex) => {
    setCurrentFile(files[newFileIndex]);
    setCurrentFileIndex(newFileIndex);
    setCurrentPageIndex(0);
    showNovel();
  }, [files, showNovel]);

  const handleDeleteFile = useCallback((index) => {
    const newFiles = [...files];
    const book_id = newFiles[index].id;
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setCurrentFile(newFiles[currentFileIndex]);
    
    if (index === currentFileIndex) {
      setCurrentFileIndex(0);
      setCurrentPageIndex(0);
    }
    api && api.deleteUserBook(user?.id, book_id);
  }, [api, files, currentFileIndex, user]);

  const changeStyle = useCallback((newStyle) => {
    const updatedStyle = Object.assign({}, style, newStyle);
    if (!isSameObject(updatedStyle, style)) {
      setStyle(updatedStyle);
      setLocalValue(NOVEL_READER_STYLE_SAVE_KEY, JSON.stringify(updatedStyle));
    }
    showNovel();
  }, [style, showNovel]);

  const toggleRightPanel = useCallback(() => {
    setIsShowRightPanel(prev => !prev);
  }, []);

  const toggleLeftPanel = useCallback(() => {
    setIsShowLeftPanel(prev => !prev);
  }, []);

  const currentFileObj = files[currentFileIndex];

  return (
    <AppContext.Provider value={{ api, user, isMobile: isMobileDevice }}>
      <div id="app">
        <Navs
          addFile={addFile}
          files={files}
          changeFileIndex={handleChangeFileIndex}
          deleteFile={handleDeleteFile}
          currentFileIndex={currentFileIndex}
          currentFile={currentFileObj}
          currentPageIndex={currentPageIndex}
          changePageIndex={changePageIndex}
          isShowLeftPanel={isShowLeftPanel}
          mode={mode}
          server={server}
        />
        <MainPanel
          currentFile={currentFileObj}
          files={files}
          style={style}
          toggleRightPanel={toggleRightPanel}
          isShowRightPanel={isShowRightPanel}
          currentPageIndex={currentPageIndex}
          toggleLeftPanel={toggleLeftPanel}
        />
        <Settings
          style={style}
          changeStyle={changeStyle}
          isShowRightPanel={isShowRightPanel}
          changeMode={changeMode}
        />
      </div>
    </AppContext.Provider>
  );
};

export default App;
