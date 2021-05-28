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

export default class CreateNew extends React.Component {
  constructor(props) {
    super(props);
    this.flashcards = [
      {
        question: 'Add question.',
        answer: 'Add answer.'
      }
    ];
    this.index = 0;
    this.question = true;
    this.state =
    {
      title: 'Untitled',
      content: this.flashcards[0].question
    };
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.previousClick = this.previousClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.addCard = this.addCard.bind(this);
  }

  onChangeTitle(event) {
    this.setState({ title: event.target.value });
  }

  onChangeContent(event) {
    this.setState({ content: event.target.value });
  }

  saveCard() {
    if (this.question) {
      this.flashcards[this.index].question = this.state.content;
    } else {
      this.flashcards[this.index].answer = this.state.content;
    }
  }

  saveAll() {
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.flashcards)
    };
    fetch('/api/cards', req)
      .then(res => res.json())
      .then(result => {

      });
  }

  previousClick() {
    this.saveCard();
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
    this.saveCard();
    if (this.index < this.flashcards.length - 1) {
      this.index++;
      this.setState(
        {
          content: this.flashcards[this.index].question
        }
      );
    }
  }

  deleteCard() {
    this.question = true;
    if (this.index > 0 && this.flashcards.length > 1) {
      this.flashcards.splice(this.index, 1);
      this.index--;
    } else if (this.index === 0 && this.flashcards.length > 1) {
      this.flashcards.splice(this.index, 1);
    } else {
      this.flashcards[this.index] =
      {
        question: 'Add question.',
        answer: 'Add answer.'
      };
    }
    this.setState({ content: this.flashcards[this.index].question });
  }

  flipCard() {
    this.saveCard();
    this.question = !this.question;
    if (this.question) {
      this.setState({ content: this.flashcards[this.index].question });
    } else {
      this.setState({ content: this.flashcards[this.index].answer });
    }
  }

  addCard() {
    this.saveCard();
    this.index = this.flashcards.length;
    this.question = true;
    this.flashcards.push(
      {
        question: 'Add question.',
        answer: 'Add answer.'
      }
    );
    this.setState({ content: this.flashcards[this.index].question });
  }

  render() {
    const sideText = this.question === true
      ? 'Question'
      : 'Answer';
    return (
      <div style={style.container}>
        <div style={style.icons}>
        <a href="#"><img className="home-icon"></img></a>
          <form className="w-100 title">
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
          <img className="save" onClick={this.saveAll}></img>
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
          <img className="delete" onClick={this.deleteCard}></img>
          <img className="question-answer" onClick={this.flipCard}></img>
          <img className="add" onClick={this.addCard}></img>
        </div>
      </div>
    );
  }
}
CreateNew.contextType = AppContext;
