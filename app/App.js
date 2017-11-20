/**
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

import './index.less?no-css-module';

// Components
import Layout from './components/component.layout/';

// Pages
import { DashboardModule } from './modules/module.dashboard/';
import { ProjectModule } from './modules/module.project/';
import { UploadModule } from './modules/module.upload/';
import { ConsoleModule } from './modules/module.console/';
import { ConfigerModule } from './modules/module.configer/';
import { UserModule } from './modules/module.user';
import { ProcessModule } from './modules/module.process';

const App = () => (
  <BrowserRouter basename="/">
    <Layout>
      <Route exact path="/" component={DashboardModule}/>
      <Route exact path="/dashboard" component={DashboardModule}/>
      <Route path="/project" component={ProjectModule}/>
      <Route path="/upload" component={UploadModule}/>
      <Route path="/configer" component={ConfigerModule}/>
      <Route path="/user" component={UserModule}/>
      <Route path="/process" component={ProcessModule}></Route>
      <ConsoleModule />
    </Layout>
  </BrowserRouter>
);

export default App;
