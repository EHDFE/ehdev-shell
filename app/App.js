/**
 * @author ryan.bian
 */
// import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { hot } from 'react-hot-loader';
import {
  LocationProvider,
  Router,
  createMemorySource,
  createHistory,
} from '@reach/router';
import Loadable from 'react-loadable';
import { Spin } from 'antd';
import ErrorBoundary from './components/component.errorBoundary/';
import './index.less?no-css-module';
import Controller from './modules/module.controller/';
// Pages
import DashboardModule from './modules/module.dashboard/';
import LayoutModule from './modules/module.layout/';
// import ReaderModule from './modules/module.reader/';

const loading = () => <Spin />;

const CommandPalette = Loadable({
  loader: () => import('./modules/module.command.palette/'),
  loading,
});
const ProjectModule = Loadable({
  loader: () => import('./modules/module.project/'),
  loading,
});
const ConfigerModule = Loadable({
  loader: () => import('./modules/module.configer/'),
  loading,
});
const QrCodeModule = Loadable({
  loader: () => import('./modules/module.qrcode/'),
  loading,
});
const UploadModule = Loadable({
  loader: () => import('./modules/module.upload/'),
  loading,
});
const PortalModule = Loadable({
  loader: () => import('./modules/module.portal/'),
  loading,
});
const UserModule = Loadable({
  loader: () => import('./modules/module.user/'),
  loading,
});
const ImageProcessModule = Loadable({
  loader: () => import('./modules/module.image.process/'),
  loading,
});
const SettingModule = Loadable({
  loader: () => import('./modules/module.setting/'),
  loading,
});

moment.locale('zh-cn');

let history;
if (process.env.NODE_ENV === 'development') {
  history = createHistory(window);
} else {
  const source = createMemorySource('/');
  history = createHistory(source);
}

const App = () => (
  <ErrorBoundary>
    <Controller>
      <LocationProvider history={history}>
        { ({ navigate, location }) => (
          <LayoutModule
            navigate={navigate}
            location={location}
          >
            <Router basepath="/" location={location}>
              <DashboardModule path="/" default />
              <UploadModule path="/upload" />
              <ProjectModule path="/project" />
              <ConfigerModule path="/configer" />
              <QrCodeModule path="/qrcode" />
              <ImageProcessModule path="/images" />
              <PortalModule path="/portal" />
              <UserModule path="/user" />
              <SettingModule path="/setting" />
            </Router>
          </LayoutModule>
        )}
      </LocationProvider>
      <CommandPalette />
    </Controller>
  </ErrorBoundary>
);
// <Route path="/images" component={ImageModule}></Route>

export default hot(module)(App);
