import React, { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import teamService from "../../services/teamService";

export function TeamFormModal({
  isOpen,
  onClose,
  onTeamCreated,
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a team name");
      return;
    }
    if (!desc.trim()) {
      setError("Please provide a short description");
      return;
    }

    setLoading(true);
    setError("");

    const skills = skillsText
      ? skillsText.split(",").map((s) => s.trim()).filter(Boolean)
      : ["React", "Design"];

    try {
      const created = await teamService.createTeam({
        name,
        desc,
        skills,
      });
      onTeamCreated(created);
      setName("");
      setDesc("");
      setSkillsText("");
      onClose();
    } catch {
      setError("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a team"
      eyebrow="New workspace"
    >
      <p className="text-sm text-slate-500 mb-5">
        Give your team a clear name and a short purpose. You can invite members after creating it.
      </p>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Team name"
          placeholder="e.g. Northstar"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Short description"
          placeholder="What are you building?"
          textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />

        <Input
          label="Skills you need"
          placeholder="e.g. React, research, pitching"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
        />

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create team
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TeamFormModal;
