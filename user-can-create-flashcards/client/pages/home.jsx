import React from 'react';
import Redirect from './redirect';
import AppContext from '../app-context';

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  icons: {
    width: '100%',
    height: '100px'
  }
};

export default class Home extends React.Component {
  render() {

    if (!this.context.user) return <Redirect to="sign-in" />;

    return (
      <div style={style.container}>
        <div style={style.icons}>
          <img className="scores"></img>
          <img className="recently-made"></img>
          <img className="share"></img>
          <img className="logout"></img>
        </div>
        <h2>My Folders</h2>
        <div className="folders">
          <div className="folder">
            <img className="opened-folder"></img>
            <span className="title">Untitled</span>
          </div>
          <img className="add-new-folder"></img>
        </div>
        <h2>My Flashcards</h2>
        <div className="workspace">
          <img className="create-new-flashcards"></img>
        </div>

      </div>
    );
  }
}
Home.contextType = AppContext;
