/**
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import 'antd/dist/antd.less';

// Components
import Layout from './components/component.layout/';

// Pages
import { DashboardModule } from './modules/module.dashboard/';
import { UploadModule } from './modules/module.upload/';


const App = () => (
  <BrowserRouter basename="/">
    <Layout>
      <Route exact path="/" component={DashboardModule}/>
      <Route path="/upload" component={UploadModule}/>
    </Layout>
  </BrowserRouter>
);

export default App;
