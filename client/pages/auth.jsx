import React from 'react';
import Redirect from './redirect';
import AuthForm from './auth-form';
import AppContext from '../app-context';

export default class AuthPage extends React.Component {
  render() {
    const style = {
      container: {
        display: 'flex',
        flexDirection: 'column'
      }
    };

    const { user, route, handleSignIn } = this.context;

    if (user) return <Redirect to="" />;

    const welcomeMessage = route.path === 'sign-in'
      ? 'Please sign in to continue'
      : 'Create an account to get started!';
    return (
      <div className="row pt-5 align-items-center" style={style.container}>
        <div className="header-picture"></div>
        <span className="author">By Hanli Tjahyono</span>
        <div className="form">
          <header className="text-center">
            <p className="text-muted mb-4">{ welcomeMessage }</p>
          </header>
          <div className="card p-3 ">
            <AuthForm
              key={route.path}
              action={route.path}
              onSignIn={handleSignIn}
              setActiveUser={this.props.setActiveUser} />
          </div>
        </div>
      </div>
    );
  }
}
AuthPage.contextType = AppContext;
