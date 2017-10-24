/**
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

import 'antd/dist/antd.less';

// Components
import Layout from './components/component.layout/';

// Pages
import { DashboardModule } from './modules/module.dashboard/';
import { ProjectModule } from './modules/module.project/';
import { UploadModule } from './modules/module.upload/';
import { ConfigerModule } from './modules/module.configer/';


const App = () => (
  <BrowserRouter basename="/">
    <Layout>
      <Route exact path="/" component={DashboardModule}/>
      <Route path="/project" component={ProjectModule}/>
      <Route path="/upload" component={UploadModule}/>
      <Route path="/configer" component={ConfigerModule}/>
    </Layout>
  </BrowserRouter>
);

export default App;
