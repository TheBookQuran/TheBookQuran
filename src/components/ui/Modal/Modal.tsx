"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import styles from "./Modal.module.css";

export type ModalProps = Dialog.DialogProps;

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export interface ModalContentProps extends Dialog.DialogContentProps {
  title?: string;
  description?: string;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content ref={ref} className={clsx(styles.content, className)} {...props}>
          <div className={styles.header}>
            {title && <Dialog.Title className={styles.title}>{title}</Dialog.Title>}
            {description && (
              <Dialog.Description className={styles.description}>
                {description}
              </Dialog.Description>
            )}
            <Dialog.Close className={styles.closeButton} aria-label="Close">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.50001L3.21846 10.9684C2.99391 11.193 2.99391 11.5571 3.21846 11.7816C3.44301 12.0062 3.80708 12.0062 4.03164 11.7816L7.50005 8.31319L10.9685 11.7816C11.193 12.0062 11.5571 12.0062 11.7816 11.7816C12.0062 11.5571 12.0062 11.193 11.7816 10.9684L8.31322 7.50001L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    );
  }
);
ModalContent.displayName = "ModalContent";

export default Modal;
