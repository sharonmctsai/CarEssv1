"""Add reminder_sent field to Reservation

Revision ID: bd2da4e3b77a
Revises: 569c5490b7e2
Create Date: 2025-03-22 21:39:27.374223

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bd2da4e3b77a'
down_revision = '569c5490b7e2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('chat', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reply', sa.String(), nullable=True))
        batch_op.alter_column('message',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=False)
        batch_op.drop_constraint('fk_chat_user_id', type_='foreignkey')

    with op.batch_alter_table('reservation', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reminder_sent', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('reservation', schema=None) as batch_op:
        batch_op.drop_column('reminder_sent')

    with op.batch_alter_table('chat', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_chat_user_id', 'user', ['user_id'], ['id'])
        batch_op.alter_column('message',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=False)
        batch_op.drop_column('reply')

    # ### end Alembic commands ###
