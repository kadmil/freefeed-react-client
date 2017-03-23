import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import Portal from 'react-portal';

import * as FrontendPrefsOptions from '../utils/frontend-preferences-options';
import UserCard from './user-card';

const DisplayOption = ({user, me, preferences, applyHyphenations}) => {
  let username, screenName;

  if (applyHyphenations) {
    username = user.username;
    screenName = user.screenName;
  } else {
    username = user.username;
    screenName = user.screenName;
  }

  if (user.username === me && preferences.useYou) {
    return <span dir="ltr">You</span>;
  }

  if (user.screenName === user.username) {
    return <span dir="ltr">{screenName}</span>;
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span dir="auto">{screenName}</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return <span dir="auto">{screenName} <span dir="ltr">({username})</span></span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return <span dir="ltr">{username}</span>;
    }
  }

  return <span>{user.screenName}</span>;
};

class UserName extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovered: false,
      isCardOpen: false
    };
    this.enterUserName = this.enterUserName.bind(this)
    this.leaveUserName = this.leaveUserName.bind(this)
  }

  enterUserName() {
    this.setState({isHovered: true});

    setTimeout(() => {
      if (this.state.isHovered) {
        const {bottom, left} = ReactDOM.findDOMNode(this).getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.setState({bottom: bottom + scrollTop, left, isCardOpen: true});
      }
    }, 500);

    if (this.props.userHover) {
      this.props.userHover.hover(this.props.user.username);
    }
  }

  leaveUserName() {
    this.setState({isHovered: false});

    setTimeout(() => {
      if (!this.state.isHovered) {
        this.setState({isCardOpen: false});
      }
    }, 500);

    if (this.props.userHover) {
      this.props.userHover.leave();
    }
  }

  render() {
    const {bottom, left} = this.state;
    return (
      <div className="user-name-wrapper"
        onMouseEnter={this.enterUserName}
        onMouseLeave={this.leaveUserName}>

        <Link to={`/${this.props.user.username}`} className={this.props.className}>
          {this.props.display ? (
            <span dir="ltr">{this.props.display}</span>
          ) : (
            <DisplayOption
              user={this.props.user}
              me={this.props.me}
              preferences={this.props.frontendPreferences.displayNames}
              applyHyphenations={this.props.applyHyphenations}/>
          )}
        </Link>

        {this.state.isCardOpen ? (
          <Portal isOpened={true}>
            <div
              onMouseEnter={this.enterUserName}
              onMouseLeave={this.leaveUserName}>
              <UserCard
                username={this.props.user.username}
                top={bottom}
                left={left}/>
            </div>
          </Portal>
        ) : false}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences
  };
};

export default connect(mapStateToProps)(UserName);
