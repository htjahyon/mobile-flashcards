import React from 'react';
import Redirect from './redirect';
import AuthForm from './auth-form';
import AppContext from '../app-context';

export default class AuthPage extends React.Component {
  render() {
    const style = {
      container: {
        display: 'flex'
      }
    };

    const { user, route, handleSignIn } = this.context;

    if (user) return <Redirect to="" />;

    const welcomeMessage = route.path === 'sign-in'
      ? 'Please sign in to continue'
      : 'Create an account to get started!';
    return (
      <div className="row pt-5 align-items-center" style={style.container}>
        <img className="justify-center header-picture"></img>
        <div className="col-12 offset-0 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-xl-4 offset-xl-4">
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
