import { lazy } from "react";
const  Home = lazy(_ => import('../../views/home/home.jsx'));

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

];

export default Routes;