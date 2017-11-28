/**
 * @author ryan.bian
 */
// import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

import './index.less?no-css-module';

// Pages
import { DashboardModule } from './modules/module.dashboard/';
import { ProjectModule } from './modules/module.project/';
import { UploadModule } from './modules/module.upload/';
import { ConfigerModule } from './modules/module.configer/';
import { UserModule } from './modules/module.user/';
import { ImageModule } from './modules/module.image/';
import { LayoutModule } from './modules/module.layout/';

const App = () => (
  <BrowserRouter basename="/">
    <LayoutModule>
      <Route exact path="/" component={DashboardModule}/>
      <Route exact path="/dashboard" component={DashboardModule}/>
      <Route path="/project" component={ProjectModule}/>
      <Route path="/upload" component={UploadModule}/>
      <Route path="/configer" component={ConfigerModule}/>
      <Route path="/user" component={UserModule}/>
      <Route path="/images" component={ImageModule}></Route>
    </LayoutModule>
  </BrowserRouter>
);

export default App;
