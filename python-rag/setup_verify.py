from loguru import logger


def check_mongo():
    try:
        from db.mongo import get_client, get_db
        client = get_client()
        db = get_db()
        logger.success(f"MongoDB connected: {db.name}")
        logger.info(f"Existing collections: {db.list_collection_names()}")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        logger.info("Make sure MongoDB is running: mongod --dbpath <your-data-path>")
        return False


def setup_indexes():
    from db.schema import setup_indexes
    setup_indexes()


def check_data_dirs():
    from config import settings
    dirs = [
        settings.data_dir,
        settings.data_dir / "parsed",
        settings.data_dir / "chunks",
        settings.data_dir / "reports",
        settings.rbi_docs_dir,
    ]
    for d in dirs:
        if d.exists():
            logger.success(f"Directory exists: {d}")
        else:
            logger.warning(f"Directory missing: {d}")


if __name__ == "__main__":
    logger.info("=== Compliance Engine — Setup Verification ===")
    check_data_dirs()
    if check_mongo():
        setup_indexes()
    logger.info("=== Done ===")
