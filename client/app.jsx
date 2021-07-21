import React from 'react';
import AppContext from './app-context';
import parseRoute from './parse-route';
import decodeToken from './decode-token';
import Auth from './pages/auth';
import Home from './pages/home';
import CreateNew from './pages/create-new';
import EditCards from './pages/edit-cards';
import Scores from './pages/scores';
import NotFound from './pages/not-found';
import PageContainer from './pages/page-container';
import SelfAssessment from './pages/self-assessment';
import Share from './pages/share';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthorizing: true,
      route: parseRoute(window.location.hash),
      activeBatch: null,
      activeFolder: null,
      activeUser: null
    };
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.setActiveBatch = this.setActiveBatch.bind(this);
    this.setActiveFolder = this.setActiveFolder.bind(this);
    this.setActiveUser = this.setActiveUser.bind(this);
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
    const token = window.localStorage.getItem('react-context-jwt');
    const user = token ? decodeToken(token) : null;
    this.setState({ user, isAuthorizing: false });
  }

  handleSignIn(result) {
    const { user, token } = result;
    window.localStorage.setItem('react-context-jwt', token);
    this.setState({ user });
  }

  handleSignOut() {
    window.localStorage.removeItem('react-context-jwt');
    this.setState({ user: null });
  }

  setActiveBatch(batch) {
    this.setState({ activeBatch: batch });
  }

  setActiveFolder(folderId) {
    this.setState({ activeFolder: folderId });
  }

  setActiveUser(userId) {
    this.setState({ activeUser: userId });
  }

  renderPage() {
    const { path } = this.state.route;
    if (path === '') {
      return <Home setActiveBatch={this.setActiveBatch} setActiveFolder={this.setActiveFolder}
       setActiveUser = {this.setActiveUser} user={this.state.activeUser}/>;
    }
    if (path === 'sign-in' || path === 'sign-up') {
      return <Auth setActiveUser={this.setActiveUser}/>;
    }
    if (path === 'create-new') {
      return <CreateNew folderId={this.state.activeFolder}/>;
    }
    if (path === 'edit-cards') {
      return <EditCards batch={this.state.activeBatch} setActiveBatch={this.setActiveBatch}/>;
    }
    if (path === 'scores') {
      return <Scores batch={this.state.activeBatch}/>;
    }
    if (path === 'self-assessment') {
      return <SelfAssessment batch={this.state.activeBatch} setActiveBatch={this.setActiveBatch}/>;
    }
    if (path === 'share') {
      return <Share userId={this.state.activeUser}/>;
    }
    return <NotFound />;
  }

  render() {
    if (this.state.isAuthorizing) return null;
    const { user, route } = this.state;
    const { handleSignIn, handleSignOut } = this;
    const contextValue = { user, route, handleSignIn, handleSignOut };
    return (
      <AppContext.Provider value={contextValue}>
        <>
          <PageContainer>
            { this.renderPage() }
          </PageContainer>
        </>
      </AppContext.Provider>
    );
  }
}
App.contextType = AppContext;
