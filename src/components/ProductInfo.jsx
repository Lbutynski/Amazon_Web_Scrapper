import Link from "next/link"
import Tippy from "@tippyjs/react"
import styles from "@/styles/ProductCard.module.css"
const ProductInfo = ({ product }) => (
  <>
    <div className={styles.ratingWrapper}>
      <span className={styles.rating}>{product.rating}</span>
      <span className={styles.votes}>({product.votes} votes)</span>
    </div>
    <h3 className={styles.title}>{product.title}</h3>
    <Link href={`/product/${product.asin}`} passHref>
      <Tippy
        content="Afficher l'historique des prix"
        theme="light-border"
        placement="bottom"
        offset={[0]}
      >
        <div className={`${styles.price} ${styles.clickable}`}>
          {product.price ? product.price : "Pas de prix connue"}
        </div>
      </Tippy>
    </Link>
  </>
)

export default ProductInfo
