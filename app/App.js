/**
 * @author ryan.bian
 */
// import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { hot } from 'react-hot-loader';
import { HashRouter, Route } from 'react-router-dom';
import ErrorBoundary from './components/component.errorBoundary/';
import './index.less?no-css-module';
import CommandPalette from './modules/module.command.palette/';
import ConfigerModule from './modules/module.configer/';
import Controller from './modules/module.controller/';
// Pages
import DashboardModule from './modules/module.dashboard/';
// import ImageModule from './modules/module.image/';
import LayoutModule from './modules/module.layout/';
import ProjectModule from './modules/module.project/';
import QrCodeModule from './modules/module.qrcode/';
import UploadModule from './modules/module.upload/';
import UserModule from './modules/module.user/';

moment.locale('zh-cn');

const App = () => (
  <ErrorBoundary>
    <Controller>
      <HashRouter basename={window.location.pathname}>
        <LayoutModule>
          <Route exact path="/" component={DashboardModule}/>
          <Route exact path="/dashboard" component={DashboardModule}/>
          <Route path="/project" component={ProjectModule}/>
          <Route path="/upload" component={UploadModule}/>
          <Route path="/configer" component={ConfigerModule}/>
          <Route path="/user" component={UserModule}/>
          <Route path="/qrcode" component={QrCodeModule} />
          <CommandPalette />
        </LayoutModule>
      </HashRouter>
    </Controller>
  </ErrorBoundary>
);
// <Route path="/images" component={ImageModule}></Route>

export default hot(module)(App);
