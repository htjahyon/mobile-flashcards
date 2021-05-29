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
  constructor(props) {
    super(props);
    this.state = {
      folders: [],
      cards: []
    };
    this.displayFolders = this.displayFolders.bind(this);
    this.displayCards = this.displayCards.bind(this);
  }

  displayFolders() {

  }

  displayCards() {
    fetch('/api/folderCards')
      .then(res => res.json())
      .then(data => this.setState({
        cards: data
      }))
      .catch(err => console.error('Fetch failed!', err));
    this.state.cards.map(cards => (
          <div key={cards.id}>
            <img className="cards" />
            <span className="title">{cards.title}</span>
          </div>
    )
    );
  }

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
          {this.displayCards}
          <a href="#create-new"><img className="create-new-flashcards" ></img></a>
        </div>
      </div>
    );
  }
}
Home.contextType = AppContext;
