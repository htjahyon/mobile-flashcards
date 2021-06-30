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
    this.trash = null;
    this.state = {
      folders: [],
      batches: [],
      openedId: 0
    };

    this.displayFolders = this.displayFolders.bind(this);
    this.displayCards = this.displayCards.bind(this);
    this.addNewFolder = this.addNewFolder.bind(this);
    this.clickFolder = this.clickFolder.bind(this);
    this.recentBatch = this.recentBatch.bind(this);
    this.trashFolder = this.trashFolder.bind(this);
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
    const count = this.folders.length + 1;
    const folder = {
      folderName: 'Folder ' + count,
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
    this.createNew = this.state.folders.length > 0
      ? <img className="create-new-flashcards" onClick={() => this.props.setActiveFolder(this.state.openedId)}></img>
      : null;
    this.trash = this.state.folders.length > 0
      ? <img className="trash" onClick={() => this.trashFolder(this.state.openedId)}></img>
      : null;
  }

  recentBatch() {
    let batch = null;
    fetch('/api/batches/')
      .then(res => res.json())
      .then(result => {
        let biggest; let bigIndex = 0;
        for (let i = 0; i < result.length; i++) {
          if (result[i].batchId > biggest) {
            biggest = result[i].batchId;
            bigIndex = i;
          }
        }
        batch = result[bigIndex];
      })
      .catch(error => console.error('recentBatch failed!', error));
    this.props.setActiveBatch(batch);
  }

  trashFolder(folderId) {
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    fetch(`api/folders/${folderId}`, req)
      .then(res => res.json())
      .then(result => {})
      .catch(error => console.error('Delete folder error!', error));
    const batchIdArray = [];
    for (let i = 0; i < this.state.batches.length; i++) {
      batchIdArray.push(this.state.batches[i].batchId);
      fetch(`api/batches/${this.state.batches[i].batchId}`, req)
        .then(res => res.json())
        .then(result => {})
        .catch(error => console.error('Delete batches error!', error));
    }
    for (let b = 0; b < batchIdArray.length; b++) {
      fetch(`api/cards/${batchIdArray[b]}`)
        .then(res => res.json())
        .then(result => {
          for (let c = 0; c < result.length; c++) {
            fetch(`api/cards/${result[c].cardId}`, req)
              .then(res1 => res1.json())
              .then(result1 => {})
              .catch(error1 => console.error('Delete cards error!', error1));

          }
        })
        .catch(error => console.error('Add batchId array error!', error));
    }
    this.displayFolders();
  }

  componentWillUnmount() {
    this.setState({
      folders: null,
      batches: null
    });
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
          <a href="#edit-cards"><img className="recently-made" onClick={this.recentBatch}></img></a>
          <img className="share"></img>
          <img className="logout" onClick={handleSignOut}></img>
        </div>
        <h2>My Folders</h2>
        <div className="folders">
          {this.folders}
          <img className="add-new-folder" onClick={this.addNewFolder}></img>
          {this.trash}
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
