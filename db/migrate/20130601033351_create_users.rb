class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :provider
      t.string :uid
      t.string :name
      t.string :email
      t.string :image
      t.string :nickname
      t.string :first_name
      t.string :last_name
      t.string :location
      t.string :description
      t.string :phone
      t.string :urls
      t.string :token
      t.datetime :token_expires_at

      t.timestamps
    end
  end
end
