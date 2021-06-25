import React from 'react';
import AppContext from '../app-context';

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  icons: {
    display: 'flex',
    width: '100%',
    height: '100px',
    justifyContent: 'center'
  }
};

export default class EditCards extends React.Component {
  constructor(props) {
    super(props);
    this.flashcards = [];
    this.index = 0;
    this.question = true;
    this.isDeletedAll = false;
    this.title = this.props.batch.cardsTitle;
    this.batch = this.props.batch;
    this.state =
    {
      title: this.title,
      content: ''
    };
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.saveAll = this.saveAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.previousClick = this.previousClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.addCard = this.addCard.bind(this);
  }

  componentDidMount() {
    fetch(`/api/cards/${this.batch.batchId}`)
      .then(res => res.json())
      .then(result => {
        this.flashcards = result;
        this.setState({ content: this.flashcards[0].question });
      })
      .catch(error => console.error('Get index error!', error));
  }

  startOver() {
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batchId: this.batchId,
        question: 'Add question.',
        answer: 'Add answer.'
      })
    };
    fetch('/api/cards', req)
      .then(res => res.json())
      .then(result => {
        this.flashcards.push(result);
      })
      .catch(error => console.error('Post error!', error));
  }

  onChangeTitle(event) {
    this.setState({ title: event.target.value });
  }

  onChangeContent(event) {
    this.setState({ content: event.target.value });
  }

  saveCard(index) {
    if (this.question) {
      this.flashcards[index].question = this.state.content;
    } else {
      this.flashcards[index].answer = this.state.content;
    }
    const cardNum = this.flashcards[index].cardId;
    const req = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.flashcards[index])
    };
    fetch(`/api/cards/${cardNum}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Patch error!', error));
  }

  saveAll() {
    // save flashcards into a folder
    this.title = this.state.title;
    this.saveCard(this.index);
    const batch = {
      folderId: this.batch.folderId,
      batchId: this.batch.batchId,
      cardsTitle: this.title
    };
    const req = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    };
    fetch(`/api/batches/${this.batch.batchId}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Post batches error!', error));
  }

  deleteAll() {
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    fetch(`/api/batches/${this.batch.batchId}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Delete batches error!', error));
    for (let i = 0; i < this.flashcards.length; i++) {
      const cardId = this.flashcards[i].cardId;
      fetch(`/api/cards/${cardId}`, req)
        .then(res => res.json())
        .then(result => { })
        .catch(error => console.error('Delete cards error!', error));
    }
    this.isDeletedAll = true;
  }

  previousClick() {
    this.saveCard(this.index);
    this.question = true;
    if (this.index > 0) {
      this.index--;
      this.setState(
        {
          content: this.flashcards[this.index].question
        }
      );
    }
  }

  nextClick() {
    this.saveCard(this.index);
    this.question = true;
    if (this.index < this.flashcards.length - 1) {
      this.index++;
      this.setState(
        {
          content: this.flashcards[this.index].question
        }
      );
    }
  }

  deleteCard(index) {
    this.question = true;
    const cardId = this.flashcards.cardId;
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    fetch(`/api/cards/${cardId}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Get error!', error));
    this.setState({ content: this.flashcards[this.index].question });
    if (this.index > 0 && this.flashcards.length > 1) {
      this.flashcards.splice(index, 1);
      this.index--;
    } else if (this.index === 0 && this.flashcards.length > 1) {
      this.flashcards.splice(index, 1);
    } else {
      this.startOver();
    }
  }

  flipCard() {
    this.saveCard(this.index);
    this.question = !this.question;
    if (this.question) {
      this.setState({ content: this.flashcards[this.index].question });
    } else {
      this.setState({ content: this.flashcards[this.index].answer });
    }
  }

  addCard() {
    this.saveCard(this.index);
    this.index = this.flashcards.length;
    this.question = true;
    const card = {
      batchId: this.batch.batchId,
      question: 'Add question.',
      answer: 'Add answer.'
    };
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(card)
    };
    fetch('/api/cards', req)
      .then(res => res.json())
      .then(result => {
        this.flashcards.push(result);
      })
      .catch(error => console.error('Post error!', error));
    this.setState({ content: this.flashcards[this.index].question });
  }

  render() {
    const sideText = this.question === true
      ? 'Question'
      : 'Answer';
    let display =
      <div style={style.container}>
        <h1 className="track-cards">Flashcards Deleted!</h1>
        <img className="trash-can track-cards"></img>
        <a href="#" className="track-cards">Go Home</a>
      </div>;
    if (!this.isDeletedAll) {
      display =
        <div style={style.container}>
          <div style={style.icons}>
            <a href="#"><img className="home-icon"></img></a>
            <form className="w-100 create-title">
              <div className="mb-3">
                <input
                  required
                  autoFocus
                  id="flashcardsName"
                  type="text"
                  name="flashcardsName"
                  value={this.state.title}
                  onChange={this.onChangeTitle}
                  className="flashcards-title bg-light" />
              </div>
            </form>
            <img className="save-all" onClick={this.saveAll}></img>
            <img className="delete-all" onClick={this.deleteAll}></img>
          </div>
          <h2 className="track-cards">{this.index + 1}/{this.flashcards.length}</h2>
          <div className="space">
            <img className="previous" onClick={this.previousClick} />
            <form className="w-100">
              <div className="mb-3">
                <textarea
                  required
                  autoFocus
                  id="flashcardsContent"
                  type="text"
                  name="flashcardsContent"
                  value={this.state.content}
                  onChange={this.onChangeContent}
                  className="form-control bg-light content" />
              </div>
            </form>
            <img className="next" onClick={this.nextClick} />
          </div>
          <h2 className="track-cards">{sideText}</h2>
          <div className="bottom-space">
            <img className="delete" onClick={() => this.deleteCard(this.index)}></img>
            <img className="question-answer" onClick={this.flipCard}></img>
            <img className="add" onClick={this.addCard}></img>
            <img className="self-assessment"></img>
          </div>
        </div>;
    }

    return (display);
  }
}
EditCards.contextType = AppContext;
