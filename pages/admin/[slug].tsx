import { getPostRef, updateUserPost } from "@modules/common/firbase";
import AuthCheck from "@modules/user/components/AuthCheck";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import styles from "@styles/Admin.module.css";
import { useForm } from "react-hook-form";
import { DocumentData, DocumentReference } from "firebase/firestore";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUploader from "@modules/common/components/ImageUploader";

export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);
  const router = useRouter();
  const { slug } = router.query;

  const postRef = getPostRef(
    slug === undefined || Array.isArray(slug) ? "" : slug
  );
  const [post] = useDocumentData(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>
            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>
          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({
  defaultValues,
  postRef,
  preview,
}: {
  defaultValues: DocumentData;
  postRef: DocumentReference;
  preview: boolean;
}): JSX.Element {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { errors, isDirty, isValid } = formState;

  const updatePost = async ({ content, published }: any) => {
    await updateUserPost(postRef, content, published);
    reset({ content, published });
    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}
      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            maxLength: 20000,
            minLength: 10,
            required: "content is required",
          })}
          name="content"
        ></textarea>

        {errors.content && errors.content.type === "required" && (
          <p className="text-danger">{errors.content.message?.toString()}</p>
        )}
        {errors.content && errors.content.type === "maxLength" && (
          <p className="text-danger">content is too long</p>
        )}
        {errors.content && errors.content.type === "minLength" && (
          <p className="text-danger">content is too short</p>
        )}

        <fieldset>
          <input
            {...register("published")}
            type="checkbox"
            name="published"
            className={styles.checkbox}
          />
          <label>Published</label>
          <button
            type="submit"
            className="btn-green"
            disabled={!isDirty || !isValid}
          >
            Save Changes
          </button>
        </fieldset>
      </div>
    </form>
  );
}
