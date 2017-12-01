import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import 'autotrack';  // used by google-analytics in ../index.jade

import '../styles/common/common.scss';
import '../styles/helvetica/app.scss';
import '../index.jade';

require.context('assets/fonts', true, /fontawesome.*/i);

import configureStore from './redux/configure-store';
import * as ActionCreators from './redux/action-creators';

import Layout from './components/layout';
import Home from './components/home';
import Discussions from './components/discussions';
import Summary from './components/summary';
import About from './components/about';
import Donate from './components/donate';
import Terms from './components/terms';
import Stats from './components/stats';
import Dev from './components/dev';
import Signin from './components/signin';
import Signup from './components/signup';
import RestorePassword from './components/restore-password';
import ResetPassword from './components/reset-password';
import Settings from './components/settings';
import Archive from './components/archive';
import SinglePost from './components/single-post';
import User from './components/user';
import Subscribers from './components/subscribers';
import Subscriptions from './components/subscriptions';
import GroupSettings from './components/group-settings';
import GroupCreate from './components/group-create';
import Groups from './components/groups';
import SearchFeed from './components/search-feed';
import PlainFeed from './components/plain-feed';
import Notifications from './components/notifications';
import Friends from './components/friends';
import ManageSubscribers from './components/manage-subscribers';
import Bookmarklet from './components/bookmarklet';
import ArchivePost from './components/archive-post';


const store = configureStore();

//request main info for user
if (store.getState().authenticated) {
  let delay = 0;

  // Defer the whoami request to let the feed load first, if we have a cached copy of whoami already
  if (store.getState().user.screenName) {
    delay = 200;
  }

  setTimeout(() => {
    store.dispatch(ActionCreators.whoAmI());
  }, delay);
} else {
  // just commented for develop sign up form
  store.dispatch(ActionCreators.unauthenticated());
}

import { bindRouteActions } from './redux/route-actions';

// Set initial history state.
// Without this, there can be problems with third-party
// modules using history API (specifically, PhotoSwipe).
browserHistory.replace({
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
});

const boundRouteActions = bindRouteActions(store.dispatch);

const history = syncHistoryWithStore(browserHistory, store);

const manageSubscribersActions = (next) => {
  const { userName } = next.params;
  store.dispatch(ActionCreators.getUserInfo(userName));
  store.dispatch(ActionCreators.subscribers(userName));
};

const friendsActions = () => {
  const { username } = store.getState().user;
  store.dispatch(ActionCreators.subscribers(username));
  store.dispatch(ActionCreators.subscriptions(username));
  store.dispatch(ActionCreators.blockedByMe(username));
};

// needed to display mutual friends
const subscribersSubscriptionsActions = (next) => {
  const { userName } = next.params;
  store.dispatch(ActionCreators.subscribers(userName));
  store.dispatch(ActionCreators.subscriptions(userName));
};

const enterStaticPage = (title) => () => {
  store.dispatch(ActionCreators.staticPage(title));
};

history.listen(() => scrollTo(0, 0));

const generateRouteHooks = (callback) => ({
  onEnter: callback,
  onChange: (_, next) => callback(next),
});

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route name="bookmarklet" path="/bookmarklet" component={Bookmarklet} />

      <Route path="/" component={Layout}>
        <IndexRoute name="home" component={Home} {...generateRouteHooks(boundRouteActions('home'))} />
        <Route path="about">
          <IndexRoute name="about" component={About} onEnter={enterStaticPage('About')} />
          <Route path="terms" component={Terms} onEnter={enterStaticPage('Terms')} />
          <Route path="stats" component={Stats} onEnter={enterStaticPage('Stats')} />
          <Route path="donate" component={Donate} onEnter={enterStaticPage('Donate')} />
        </Route>
        <Route path="dev" component={Dev} onEnter={enterStaticPage('Developers')} />
        <Route path="signin" component={Signin} onEnter={enterStaticPage('Sign in')} />
        <Route path="signup" component={Signup} onEnter={enterStaticPage('Sign up')} />
        <Route path="restore" component={RestorePassword} />
        <Route path="reset" component={ResetPassword} />
        <Route path="settings" component={Settings} onEnter={enterStaticPage('Settings')} />
        <Route path="settings/archive" component={Archive} onEnter={enterStaticPage('Restore from FriendFeed.com Archives')} />
        <Route name="groupSettings" path="/:userName/settings" component={GroupSettings} {...generateRouteHooks(boundRouteActions('getUserInfo'))} />
        <Route name="discussions" path="filter/discussions" component={Discussions} {...generateRouteHooks(boundRouteActions('discussions'))} />
        <Route name="summary" path="/summary(/:days)" component={Summary} {...generateRouteHooks(boundRouteActions('summary'))} />
        <Route name="direct" path="filter/direct" component={Discussions} {...generateRouteHooks(boundRouteActions('direct'))} />
        <Route name="search" path="search" component={SearchFeed} {...generateRouteHooks(boundRouteActions('search'))} />
        <Route name="notifications" path="filter/notifications" component={Notifications} {...generateRouteHooks(boundRouteActions('notifications'))} />
        <Route name="best_of" path="filter/best_of" component={PlainFeed} {...generateRouteHooks(boundRouteActions('best_of'))} />
        <Route name="groups" path="/groups" component={Groups} onEnter={enterStaticPage('Groups')} />
        <Route name="friends" path="/friends" component={Friends} onEnter={friendsActions} />
        <Route name="groupCreate" path="/groups/create" component={GroupCreate} onEnter={enterStaticPage('Create a group')} />
        <Route name="archivePost" path="/archivePost" component={ArchivePost} {...generateRouteHooks(boundRouteActions('archivePost'))} />
        <Route name="userFeed" path="/:userName" component={User} {...generateRouteHooks(boundRouteActions('userFeed'))} />
        <Route name="memories" path="/memories/:from" component={PlainFeed} {...generateRouteHooks(boundRouteActions('memories'))} />
        <Route name="userMemories" path="/:userName/memories/:from" component={PlainFeed} {...generateRouteHooks(boundRouteActions('userMemories'))} />
        <Route name="userSummary" path="/:userName/summary(/:days)" component={User} {...generateRouteHooks(boundRouteActions('userSummary'))} />
        <Route name="subscribers" path="/:userName/subscribers" component={Subscribers} onEnter={subscribersSubscriptionsActions} />
        <Route name="subscriptions" path="/:userName/subscriptions" component={Subscriptions} onEnter={subscribersSubscriptionsActions} />
        <Route name="manage-subscribers" path="/:userName/manage-subscribers" component={ManageSubscribers} onEnter={manageSubscribersActions} />
        <Route name="userComments" path="/:userName/comments" component={User} {...generateRouteHooks(boundRouteActions('userComments'))} />
        <Route name="userLikes" path="/:userName/likes" component={User} {...generateRouteHooks(boundRouteActions('userLikes'))} />
        <Route name="post" path="/:userName/:postId" component={SinglePost} {...generateRouteHooks(boundRouteActions('post'))} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
