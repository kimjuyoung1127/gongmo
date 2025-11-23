

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';






CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";





CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";








CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category_code" "text" NOT NULL,
    "category_name_kr" "text" NOT NULL,
    "default_expiry_days" integer DEFAULT 7 NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id";










CREATE TABLE IF NOT EXISTS "public"."expiry_rules" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "match_type" "text" NOT NULL,
    "pattern" "text" NOT NULL,
    "override_days" integer NOT NULL,
    "notes" "text",
    CONSTRAINT "expiry_rules_match_type_check" CHECK (("match_type" = ANY (ARRAY['regex'::"text", 'exact'::"text"])))
);


ALTER TABLE "public"."expiry_rules" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."expiry_rules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."expiry_rules_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expiry_rules_id_seq" OWNED BY "public"."expiry_rules"."id";









CREATE TABLE IF NOT EXISTS "public"."inventory" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "receipt_item_id" bigint,
    "category_id" bigint,
    "barcode" "text",
    "name" "text" NOT NULL,
    "purchase_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "expiry_date" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "source_type" "text" DEFAULT 'receipt'::"text",
    "store_name" "text",
    "raw_text" "text",
    "receipt_image_url" "text",
    CONSTRAINT "inventory_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'consumed'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."inventory" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inventory_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inventory_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inventory_id_seq" OWNED BY "public"."inventory"."id";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "barcode" "text" NOT NULL,
    "product_name" "text" NOT NULL,
    "category_id" bigint,
    "manufacturer" "text" DEFAULT '알 수 없음'::"text",
    "source" "text" DEFAULT 'unknown'::"text",
    "verified" boolean DEFAULT false
);


ALTER TABLE "public"."products" OWNER TO "postgres";





CREATE TABLE IF NOT EXISTS "public"."receipt_items" (
    "id" bigint NOT NULL,
    "receipt_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "raw_text" "text" NOT NULL,
    "clean_text" "text",
    "category_id" bigint,
    "expiry_days" integer,
    "status" "text" DEFAULT 'parsed'::"text",
    CONSTRAINT "receipt_items_status_check" CHECK (("status" = ANY (ARRAY['parsed'::"text", 'added_to_inventory'::"text", 'ignored'::"text"])))
);


ALTER TABLE "public"."receipt_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."receipt_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."receipt_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."receipt_items_id_seq" OWNED BY "public"."receipt_items"."id";



CREATE TABLE IF NOT EXISTS "public"."receipts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "store_name" "text",
    "purchase_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "image_url" "text",
    "ocr_text" "text"
);


ALTER TABLE "public"."receipts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."receipts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."receipts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."receipts_id_seq" OWNED BY "public"."receipts"."id";



CREATE OR REPLACE VIEW "public"."upcoming_expirations" AS
 SELECT "id",
    "user_id",
    "name",
    "category_id",
    "expiry_date",
    "purchase_date",
    "status",
    "quantity",
    ("expiry_date" - CURRENT_DATE) AS "days_remaining"
   FROM "public"."inventory"
  WHERE ("status" = 'active'::"text")
  ORDER BY "expiry_date";


ALTER VIEW "public"."upcoming_expirations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expiry_rules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expiry_rules_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inventory" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inventory_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."receipt_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."receipt_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."receipts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."receipts_id_seq"'::"regclass");







ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_category_code_key" UNIQUE ("category_code");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");







ALTER TABLE ONLY "public"."expiry_rules"
    ADD CONSTRAINT "expiry_rules_pkey" PRIMARY KEY ("id");







ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_barcode_key" UNIQUE ("barcode");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");







ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."receipts"
    ADD CONSTRAINT "receipts_pkey" PRIMARY KEY ("id");







CREATE INDEX "idx_inventory_barcode" ON "public"."inventory" USING "btree" ("barcode");



CREATE INDEX "idx_inventory_expiry_date" ON "public"."inventory" USING "btree" ("expiry_date");



CREATE INDEX "idx_inventory_status" ON "public"."inventory" USING "btree" ("status");



CREATE INDEX "idx_inventory_user_id" ON "public"."inventory" USING "btree" ("user_id");



CREATE INDEX "idx_products_barcode" ON "public"."products" USING "btree" ("barcode");







CREATE OR REPLACE TRIGGER "handle_inventory_updated_at" BEFORE UPDATE ON "public"."inventory" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();















ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_receipt_item_id_fkey" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."receipt_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;







ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipts"
    ADD CONSTRAINT "receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow ALL operations for OWN user" ON "public"."inventory" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow ALL operations for OWN user" ON "public"."receipt_items" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow ALL operations for OWN user" ON "public"."receipts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));







CREATE POLICY "Allow insert for authenticated users" ON "public"."products" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public read access" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."expiry_rules" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."products" FOR SELECT USING (true);



ALTER TABLE "public"."expiry_rules" ENABLE ROW LEVEL SECURITY;






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";







GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";







GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";







GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";







GRANT ALL ON TABLE "public"."expiry_rules" TO "anon";
GRANT ALL ON TABLE "public"."expiry_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."expiry_rules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expiry_rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expiry_rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expiry_rules_id_seq" TO "service_role";







GRANT ALL ON TABLE "public"."inventory" TO "anon";
GRANT ALL ON TABLE "public"."inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";







GRANT ALL ON TABLE "public"."receipt_items" TO "anon";
GRANT ALL ON TABLE "public"."receipt_items" TO "authenticated";
GRANT ALL ON TABLE "public"."receipt_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."receipt_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."receipt_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."receipt_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."receipts" TO "anon";
GRANT ALL ON TABLE "public"."receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."receipts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."receipts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."receipts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."receipts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."upcoming_expirations" TO "anon";
GRANT ALL ON TABLE "public"."upcoming_expirations" TO "authenticated";
GRANT ALL ON TABLE "public"."upcoming_expirations" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






