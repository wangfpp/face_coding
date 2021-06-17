import { lazy } from "react";
const  Home = lazy(_ => import('../../views/home/home.jsx'));
const Main = lazy(_ => import("../../views/main/main.jsx"));

const Routes = [
    {
		path: '/',
		component: Home,
		title: '首页',
		exact: true,
		name: 'home'
	},
    {
    	path: '/home',
		component: Home,
		title: '首页',
		exact: true,
		name: 'home'
	},
	{
    	path: '/main',
		component: Main,
		title: '主页',
		exact: true,
		name: 'main'
	},

];

export default Routes;