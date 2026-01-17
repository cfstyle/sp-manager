import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from '../components/Layout.vue';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Search from '../pages/Search.vue';
import Editor from '../pages/Editor.vue';
import Diff from '../pages/Diff.vue';
import Activity from '../pages/Activity.vue';
import MyProcedures from '../pages/MyProcedures.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                name: 'Search',
                component: Search,
            },
            {
                path: 'my-procedures',
                name: 'MyProcedures',
                component: MyProcedures,
            },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard,
            },
            {
                path: 'new',
                name: 'Create',
                component: Editor,
            },
            {
                path: 'editor/:id',
                name: 'Editor',
                component: Editor,
            },
            {
                path: 'diff/:id/:v1/:v2',
                name: 'Diff',
                component: Diff,
            },
            {
                path: 'activity',
                name: 'Activity',
                component: Activity,
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('access_token');
    if (to.name !== 'Login' && !token) {
        next({ name: 'Login' });
    } else {
        next();
    }
});

export default router;
