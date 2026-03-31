import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ProfileForm } from "./profile-form";

const meta: Meta<typeof ProfileForm> = {
  title: "Features/Settings/ProfileForm",
  component: ProfileForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileForm>;

export const Default: Story = {
  args: {
    initialData: {
      name: "Test User",
      image: null,
    },
  },
};

export const WithImage: Story = {
  args: {
    initialData: {
      name: "Test User",
      image: "https://github.com/shadcn.png",
    },
  },
};

export const EditName: Story = {
  args: {
    initialData: {
      name: "Test User",
      image: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameInput = canvas.getByLabelText("名前");
    await expect(nameInput).toHaveValue("Test User");

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Name");

    await expect(nameInput).toHaveValue("Updated Name");
  },
};

export const ClearNameValidation: Story = {
  args: {
    initialData: {
      name: "Test User",
      image: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameInput = canvas.getByLabelText("名前");
    await userEvent.clear(nameInput);

    // Trigger validation by blurring
    await userEvent.tab();

    await expect(nameInput).toHaveValue("");
  },
};
