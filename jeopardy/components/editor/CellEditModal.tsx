"use client";

import { useEffect, useState } from "react";
import type { Cell } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type CellEditModalProps = {
  isOpen: boolean;
  cell: Cell | null;
  onClose: () => void;
  onSave: (
    question: string,
    answer: string,
    questionImage: string,
    questionVideo: string,
    answerImage: string,
    answerVideo: string
  ) => void;
};

const CellEditModal = ({ isOpen, cell, onClose, onSave }: CellEditModalProps) => {
  const [question, setQuestion] = useState<string>(cell?.question.text ?? "");
  const [answer, setAnswer] = useState<string>(cell?.answer.text ?? "");
  const [questionImage, setQuestionImage] = useState<string>(cell?.question.imageUrl ?? "");
  const [questionVideo, setQuestionVideo] = useState<string>(cell?.question.videoUrl ?? "");
  const [answerImage, setAnswerImage] = useState<string>(cell?.answer.imageUrl ?? "");
  const [answerVideo, setAnswerVideo] = useState<string>(cell?.answer.videoUrl ?? "");

  useEffect(() => {
    if (cell) {
      setQuestion(cell.question.text ?? "");
      setAnswer(cell.answer.text ?? "");
      setQuestionImage(cell.question.imageUrl ?? "");
      setQuestionVideo(cell.question.videoUrl ?? "");
      setAnswerImage(cell.answer.imageUrl ?? "");
      setAnswerVideo(cell.answer.videoUrl ?? "");
    }
  }, [cell]);

  const handleSave = () => {
    onSave(question, answer, questionImage, questionVideo, answerImage, answerVideo);
  };

  return (
    <Modal isOpen={isOpen} title="Edit Cell" onClose={onClose}>
      <div className="field">
        <label className="field-label">Question</label>
        <textarea
          className="input input-textarea"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
        />
      </div>
      <div className="field">
        <label className="field-label">Question image URL</label>
        <input
          className="input"
          value={questionImage}
          onChange={(event) => setQuestionImage(event.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="field">
        <label className="field-label">Question video URL</label>
        <input
          className="input"
          value={questionVideo}
          onChange={(event) => setQuestionVideo(event.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="field">
        <label className="field-label">Answer</label>
        <textarea
          className="input input-textarea"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={3}
        />
      </div>
      <div className="field">
        <label className="field-label">Answer image URL</label>
        <input
          className="input"
          value={answerImage}
          onChange={(event) => setAnswerImage(event.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="field">
        <label className="field-label">Answer video URL</label>
        <input
          className="input"
          value={answerVideo}
          onChange={(event) => setAnswerVideo(event.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
};

export default CellEditModal;
