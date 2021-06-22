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
    this.folders = null;
    this.batches = null;
    this.maxFolders = 5;
    this.maxBatches = 6;
    this.createNew = null;
    this.state = {
      folders: [],
      batches: [],
      openedId: 0
    };

    this.displayFolders = this.displayFolders.bind(this);
    this.displayCards = this.displayCards.bind(this);
    this.addNewFolder = this.addNewFolder.bind(this);
    this.clickFolder = this.clickFolder.bind(this);
  }

  componentDidMount() {
    this.displayFolders();
  }

  displayFolders() {
    fetch('/api/folders')
      .then(res => res.json())
      .then(data => {
        this.setState({
          folders: data
        });
      })
      .catch(err => console.error('Fetch folders failed!', err));
  }

  displayCards(folderId) {
    fetch(`/api/batches/${folderId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          batches: data
        });
      })
      .catch(err => console.error('Fetch failed!', err));
  }

  addNewFolder() {
    if (this.folders.length >= this.maxFolders) return;
    const folder = {
      folderName: 'Folder ' + this.folders.length,
      userId: 1
    };
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folder)
    };
    fetch('/api/folders/', req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Post folder error!', error));
    this.displayFolders();
  }

  clickFolder(folderId) {
    this.setState({ openedId: folderId });
    this.displayCards(folderId);
    this.createNew = <img className="create-new-flashcards"
      onClick={() => this.props.setActiveFolder(this.state.openedId)}></img>;
  }

  render() {
    this.folders = this.state.folders.map(folder => (
      <div key={folder.folderId}>
        <div className={`folder ${folder.folderId === this.state.openedId ? 'opened-folder' : 'closed-folder'}`}
        onClick={() => this.clickFolder(folder.folderId)}></div>
        <span className="title">{folder.folderName}</span>
      </div>
    ));
    this.batches = this.state.batches.map(batch => (
      <div className="folder" key={batch.batchId}>
       <a href="#edit-cards"><div className="batch" onClick={() => this.props.setActiveBatch(batch)}></div></a>
        <span className="title">{batch.cardsTitle}</span>
      </div>
    ));

    if (!this.context.user) return <Redirect to="sign-in" />;
    const { handleSignOut } = this.context;
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#scores"><img className="scores"></img></a>
          <img className="recently-made"></img>
          <img className="share"></img>
          <img className="logout" onClick={handleSignOut}></img>
        </div>
        <h2>My Folders</h2>
        <div className="folders">
          {this.folders}
          <img className="add-new-folder" onClick={this.addNewFolder}></img>
        </div>
        <h2>My Flashcards</h2>
        <div className="workspace">
          {this.batches}
          <a href="#create-new">{this.createNew}</a>
        </div>
      </div>
    );
  }
}
Home.contextType = AppContext;
