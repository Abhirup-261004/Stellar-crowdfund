import { useState } from "react";

const initialState = {
  title: "",
  description: "",
  goal: "",
  deadline: "",
};

export default function CreateCampaignForm({ onSubmit, disabled }) {
  const [form, setForm] = useState(initialState);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      goal: form.goal.trim(),
      deadline: deadlineTimestamp,
    });

    setForm(initialState);
  }

  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
          Create Campaign
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Launch a fundraiser</h2>
        <p className="mt-2 text-sm text-slate-500">
          Use raw token units for your goal. Example: `10000000`.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
          <input
            required
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="Build a community solar project"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            required
            name="description"
            value={form.description}
            onChange={updateField}
            rows={5}
            placeholder="Explain the mission, timeline, and how funds will be used."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Funding Goal</label>
          <input
            required
            min="1"
            name="goal"
            type="number"
            value={form.goal}
            onChange={updateField}
            placeholder="1000"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Deadline</label>
          <input
            required
            name="deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={updateField}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {disabled ? "Connect wallet to continue" : "Create Campaign"}
        </button>
      </form>
    </section>
  );
}
