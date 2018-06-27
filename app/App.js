/**
 * @author ryan.bian
 */
// import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { hot } from 'react-hot-loader';
import { Router } from '@reach/router';
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
import ImageProcessModule from './modules/module.image.process/';
import SettingModule from './modules/module.setting/';

moment.locale('zh-cn');

const App = () => (
  <ErrorBoundary>
    <Controller>
      <Router>
        <LayoutModule path="/">
          <DashboardModule default />
          <UploadModule path="upload" />
          <ProjectModule path="project" />
          <ConfigerModule path="configer" />
          <QrCodeModule path="qrcode" />
          <ImageProcessModule path="images" />
          <UserModule path="user" />
          <SettingModule path="setting" />
        </LayoutModule>
      </Router>
      <CommandPalette />
    </Controller>
  </ErrorBoundary>
);
// <Route path="/images" component={ImageModule}></Route>

export default hot(module)(App);
